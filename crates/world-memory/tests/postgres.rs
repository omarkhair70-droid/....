use postgres::{Client, NoTls};
use std::sync::{Arc, Barrier};
use std::thread;
use world_kernel::Rejection;
use world_language::{Command, Id, ScopedReply};
use world_memory::access::{Access, IdentityVerifier, Request, VerifyError};
use world_memory::{Memory, MemoryError};

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn command(n: u64, revision: u64, kind: &str, payload: &str) -> Command {
    Command::parse(&format!(
        r#"{{"schema_version":"0.1","command_id":"{}","work_id":"{}","expected_revision":{},"kind":"{}","payload":{}}}"#,
        id(n).as_str(),
        id(10).as_str(),
        revision,
        kind,
        payload
    ))
    .unwrap()
}

fn connection(url: &str) -> Client {
    // CI-only: no TLS on an isolated loopback service. Production TLS is pending.
    Client::connect(url, NoTls).unwrap()
}

// Explicit fake verifier, available only in this isolated integration test.
// No production credential can be authenticated by this fixture.
struct FixtureVerifier;

impl IdentityVerifier for FixtureVerifier {
    fn verify(&self, credential: &str) -> Result<Id, VerifyError> {
        match credential {
            "synthetic-owner" => Ok(id(1)),
            "synthetic-recipient" => Ok(id(2)),
            "synthetic-stranger" => Ok(id(3)),
            "synthetic-outage" => Err(VerifyError::Unavailable),
            _ => Err(VerifyError::Invalid),
        }
    }
}

const WORK: &str = "00000000-0000-4000-8000-00000000000a";
const SHARE: &str = "00000000-0000-4000-8000-000000000014";
const SCOPED_RAW: &str = r#"{"schema_version":"0.1","command_id":"00000000-0000-4000-8000-000000000110","work_id":"00000000-0000-4000-8000-00000000000a","payload":{"share_id":"00000000-0000-4000-8000-000000000014","snapshot_revision":1,"response":"request_change"}}"#;

fn assert_access_boundary(mem: &mut Memory) {
    let mut access = Access::new(mem, &FixtureVerifier);
    let owner = access.handle("synthetic-owner", Request::OwnerView(WORK), 5);
    assert_eq!(owner.status, 200);
    assert_eq!(owner.body["body"], "Private");
    let denied = access.handle("synthetic-recipient", Request::OwnerView(WORK), 5);
    assert_eq!(denied.status, 404);
    let missing = access.handle("synthetic-recipient", Request::OwnerView(id(99).as_str()), 5);
    assert_eq!(denied.body, missing.body);
    let unauth = access.handle("invalid", Request::OwnerCommand("not json"), 5);
    assert_eq!(unauth.status, 401);
    let outage = access.handle("synthetic-outage", Request::OwnerView(WORK), 5);
    assert_eq!(outage.status, 503);

    let request = || Request::SharedView { work: WORK, share: SHARE };
    let scoped = access.handle("synthetic-recipient", request(), 5);
    assert_eq!(scoped.status, 200);
    assert_eq!(scoped.body["scope_text"], "Discussion");
    let mut keys: Vec<_> = scoped.body.as_object().unwrap().keys().map(String::as_str).collect();
    keys.sort_unstable();
    assert_eq!(keys, ["responses", "scope_text", "share_id", "snapshot_revision", "title"]);
    assert!(!scoped.body.to_string().contains("Private"));
    let stranger = access.handle("synthetic-stranger", request(), 5);
    assert_eq!(stranger.status, 404);
    assert_eq!(stranger.body, denied.body);

    let spoof = SCOPED_RAW.replacen("{", r#"{"actor_id":"00000000-0000-4000-8000-000000000002","#, 1);
    let blocked = access.handle("synthetic-stranger", Request::ScopedReply(&spoof), 5);
    assert_eq!(blocked.status, 400);
    let stranger_reply = access.handle("synthetic-stranger", Request::ScopedReply(SCOPED_RAW), 5);
    assert_eq!(stranger_reply.status, 404);
    let retry = access.handle("synthetic-recipient", Request::ScopedReply(SCOPED_RAW), 5);
    assert_eq!(retry.status, 200);
    assert_eq!(retry.body.as_object().unwrap().len(), 3);
    assert_eq!(retry.body["snapshot_revision"], 1);
    assert!(retry.body.get("revision").is_none());
    assert!(retry.body.get("work_id").is_none());
}

#[test]
#[ignore = "requires dedicated empty synthetic PostgreSQL database; CI runs explicitly"]
fn durable_history_scoped_access_and_concurrent_writes() {
    let runtime_url = std::env::var("WORLD_TEST_DATABASE_URL").unwrap();
    let admin_url = std::env::var("WORLD_TEST_ADMIN_URL").unwrap();
    assert!(runtime_url.contains("127.0.0.1:"));
    assert!(admin_url.contains("127.0.0.1:"));
    let mut admin = connection(&admin_url);
    let mut mem = Memory::new(connection(&runtime_url));
    let create = command(
        100,
        0,
        "CreateWork",
        r#"{"title":"Original","body":"Private"}"#,
    );
    let first = mem.submit_owner(&id(1), create.clone(), 1).unwrap();
    drop(mem);
    let mut mem = Memory::new(connection(&runtime_url));
    assert_eq!(mem.submit_owner(&id(1), create, 99).unwrap(), first);
    assert_eq!(
        mem.owner_view(&id(1), &id(10)).unwrap().unwrap().body,
        "Private"
    );
    assert!(mem.owner_view(&id(2), &id(10)).unwrap().is_none());
    let share = command(
        101,
        1,
        "ShareWork",
        r#"{"share_id":"00000000-0000-4000-8000-000000000014","recipient_id":"00000000-0000-4000-8000-000000000002","title":"Excerpt","scope_text":"Discussion","permission":"view_respond"}"#,
    );
    mem.submit_owner(&id(1), share, 2).unwrap();
    let gate = Arc::new(Barrier::new(2));
    let handles: Vec<_> = (0..2)
        .map(|n| {
            let gate = gate.clone();
            let url = runtime_url.clone();
            thread::spawn(move || {
                let mut memory = Memory::new(connection(&url));
                let cmd = command(
                    102 + n,
                    2,
                    "ReviseWork",
                    &format!(r#"{{"title":"Revision {n}","body":"Private"}}"#),
                );
                gate.wait();
                memory.submit_owner(&id(1), cmd, 3)
            })
        })
        .collect();
    let outcomes: Vec<_> = handles.into_iter().map(|h| h.join().unwrap()).collect();
    assert_eq!(outcomes.iter().filter(|r| r.is_ok()).count(), 1);
    assert_eq!(
        outcomes
            .iter()
            .filter(|r| **r == Err(MemoryError::Domain(Rejection::StaleRevision)))
            .count(),
        1
    );
    let reply = ScopedReply::parse(
        r#"{"schema_version":"0.1","command_id":"00000000-0000-4000-8000-000000000110","work_id":"00000000-0000-4000-8000-00000000000a","payload":{"share_id":"00000000-0000-4000-8000-000000000014","snapshot_revision":1,"response":"request_change"}}"#,
    ).unwrap();
    assert_eq!(
        mem.respond(&id(3), &reply, 4),
        Err(MemoryError::Domain(Rejection::Denied))
    );
    let receipt = mem.respond(&id(2), &reply, 4).unwrap();
    assert_eq!(receipt.snapshot_revision, 1);
    drop(mem);
    let mut mem = Memory::new(connection(&runtime_url));
    assert_eq!(mem.respond(&id(2), &reply, 5).unwrap(), receipt);
    let view = mem.shared_view(&id(2), &id(10), &id(20)).unwrap().unwrap();
    assert_eq!(view.scope_text, "Discussion");
    assert_eq!(view.responses.len(), 1);
    assert!(mem.shared_view(&id(3), &id(10), &id(20)).unwrap().is_none());
    assert_access_boundary(&mut mem);
    mem.submit_owner(
        &id(1),
        command(
            120,
            4,
            "RevokeShare",
            r#"{"share_id":"00000000-0000-4000-8000-000000000014"}"#,
        ),
        6,
    )
    .unwrap();
    assert!(mem.shared_view(&id(2), &id(10), &id(20)).unwrap().is_none());
    assert_eq!(
        mem.respond(&id(2), &reply, 7),
        Err(MemoryError::Domain(Rejection::Denied))
    );
    {
        let mut access = Access::new(&mut mem, &FixtureVerifier);
        let retry = access.handle("synthetic-recipient", Request::ScopedReply(SCOPED_RAW), 7);
        assert_eq!(retry.status, 404);
        let view = access.handle("synthetic-recipient", Request::SharedView { work: WORK, share: SHARE }, 7);
        assert_eq!(view.status, 404);
        assert_eq!(retry.body, view.body);
    }
    let count: i64 = admin
        .query_one("SELECT count(*) FROM world_private.events", &[])
        .unwrap()
        .get(0);
    assert_eq!(count, 5);
    let mut restricted = connection(&runtime_url);
    assert!(
        restricted
            .execute("DELETE FROM world_private.events", &[])
            .is_err()
    );
    assert!(
        restricted
            .execute(
                "UPDATE world_private.principals SET principal_id = principal_id",
                &[]
            )
            .is_err()
    );
    // Inject an insert failure after successful domain admission, then prove
    // the transaction did not advance the cursor or publish new state.
    admin
        .batch_execute("ALTER TABLE world_private.events ADD CONSTRAINT test_fail CHECK (seq < 6)")
        .unwrap();
    let next = command(
        121,
        5,
        "ReviseWork",
        r#"{"title":"After failure","body":"Private"}"#,
    );
    assert_eq!(
        mem.submit_owner(&id(1), next.clone(), 8),
        Err(MemoryError::Database)
    );
    assert_eq!(
        mem.owner_view(&id(1), &id(10)).unwrap().unwrap().revision,
        5
    );
    admin
        .batch_execute("ALTER TABLE world_private.events DROP CONSTRAINT test_fail")
        .unwrap();
    assert_eq!(mem.submit_owner(&id(1), next, 8).unwrap().revision, 6);
    // Simulated privileged truncation: head/log mismatch must stop reads and writes.
    admin
        .execute("DELETE FROM world_private.events WHERE seq = 6", &[])
        .unwrap();
    assert!(matches!(
        mem.owner_view(&id(1), &id(10)),
        Err(MemoryError::CorruptHistory)
    ));
    let mut access = Access::new(&mut mem, &FixtureVerifier);
    let failed = access.handle("synthetic-owner", Request::OwnerView(WORK), 10);
    assert_eq!(failed.status, 503);
    assert_eq!(failed.body, serde_json::json!({"error":"unavailable"}));
}
