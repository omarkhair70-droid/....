use postgres::{Client, NoTls};
use std::sync::{Arc, Barrier};
use std::thread;
use world_kernel::Rejection;
use world_language::{Command, Id, ScopedReply};
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
}
