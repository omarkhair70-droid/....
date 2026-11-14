use serde_json::{Value, json};
use world_kernel::{Kernel, Rejection};
use world_language::{Command, Id, Response};

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn command(n: u64, revision: u64, kind: &str, payload: Value) -> Command {
    Command::parse(
        &json!({
            "schema_version":"0.1",
            "command_id":id(n),
            "work_id":id(10),
            "expected_revision":revision,
            "kind":kind,
            "payload":payload
        })
        .to_string(),
    )
    .unwrap()
}

fn create() -> Command {
    command(100, 0, "CreateWork", json!({"title":"Original", "body":"Private original"}))
}

fn revise(n: u64, revision: u64) -> Command {
    command(n, revision, "ReviseWork", json!({"title":"Revised", "body":"Private revision"}))
}

fn share(n: u64, revision: u64) -> Command {
    command(n, revision, "ShareWork", json!({
        "share_id":id(20),
        "recipient_id":id(2),
        "title":"Excerpt",
        "scope_text":"Can we discuss this?",
        "permission":"view_respond"
    }))
}

fn reply(n: u64, revision: u64, snapshot: u64) -> Command {
    command(n, revision, "RespondToShare", json!({
        "share_id":id(20),
        "snapshot_revision":snapshot,
        "response":"interested_in_discussion"
    }))
}

fn revoke(n: u64, revision: u64) -> Command {
    command(n, revision, "RevokeShare", json!({"share_id":id(20)}))
}

fn initial() -> Kernel {
    let mut kernel = Kernel::new([id(1), id(2), id(3)]);
    kernel.submit(&id(1), create(), 1).unwrap();
    kernel
}

#[test]
fn identity_and_snapshot_survive_the_world_changing() {
    let mut k = initial();
    k.submit(&id(1), share(101, 1), 2).unwrap();
    let before = k.shared_view(&id(2), &id(10), &id(20)).unwrap();
    k.submit(&id(1), revise(102, 2), 3).unwrap();
    assert!(k.shared_view(&id(2), &id(10), &id(20)).unwrap() == before);
    assert_eq!(k.submit(&id(2), reply(103, 3, 3), 4), Err(Rejection::WrongSnapshot));
    assert_eq!(k.submit(&id(2), reply(104, 2, 1), 4), Err(Rejection::StaleRevision));
    k.submit(&id(2), reply(105, 3, 1), 4).unwrap();
    let owner = k.owner_view(&id(1), &id(10)).unwrap();
    assert_eq!(owner.work_id, id(10));
    assert_eq!(owner.revision, 4);
    assert_eq!(owner.title, "Revised");
    assert_eq!(owner.shares[0].disclosed.snapshot_revision, 1);
    assert_eq!(owner.shares[0].disclosed.responses[0].response, Response::InterestedInDiscussion);
    assert_eq!(owner.shares[0].disclosed.responses[0].snapshot_revision, 1);
    assert_eq!(k.history().len(), 4);
}

#[test]
fn scoped_access_and_revocation_recheck_on_retry() {
    let mut k = initial();
    k.submit(&id(1), share(101, 1), 2).unwrap();
    assert!(k.owner_view(&id(2), &id(10)).is_none());
    assert!(k.shared_view(&id(3), &id(10), &id(20)).is_none());
    assert_eq!(k.submit(&id(3), reply(102, 2, 1), 3), Err(Rejection::Denied));
    assert_eq!(k.submit(&id(2), revise(103, 2), 3), Err(Rejection::Denied));
    assert_eq!(k.submit(&id(1), reply(104, 2, 1), 3), Err(Rejection::Denied));
    let response = reply(105, 2, 1);
    k.submit(&id(2), response.clone(), 3).unwrap();
    k.submit(&id(1), revoke(106, 3), 4).unwrap();
    assert!(k.shared_view(&id(2), &id(10), &id(20)).is_none());
    assert_eq!(k.submit(&id(2), response, 5), Err(Rejection::Denied));
    assert_eq!(k.submit(&id(2), reply(107, 4, 1), 5), Err(Rejection::Denied));
    assert_eq!(k.history().len(), 4);
    assert!(k.owner_view(&id(1), &id(10)).unwrap().shares[0].revoked);
}

#[test]
fn exact_retry_collision_and_noop() {
    let mut k = initial();
    let cmd = revise(101, 1);
    let receipt = k.submit(&id(1), cmd.clone(), 2).unwrap();
    assert_eq!(k.submit(&id(1), cmd, 99).unwrap(), receipt);
    assert_eq!(k.submit(&id(1), share(101, 2), 3), Err(Rejection::CommandCollision));
    assert_eq!(k.submit(&id(1), revise(102, 2), 3), Err(Rejection::NoChange));
    assert_eq!(k.submit(&id(2), create(), 3), Err(Rejection::Denied));
    assert_eq!(k.owner_view(&id(1), &id(10)).unwrap().revision, 2);
    assert_eq!(k.history().len(), 2);
}

#[test]
fn replay_reconstructs_the_same_meaning_and_rejects_duplicate_record() {
    let mut k = initial();
    k.submit(&id(1), share(101, 1), 2).unwrap();
    k.submit(&id(1), revise(102, 2), 3).unwrap();
    k.submit(&id(2), reply(103, 3, 1), 4).unwrap();
    let recovered = Kernel::replay([id(1), id(2), id(3)], k.history()).unwrap();
    assert!(k.owner_view(&id(1), &id(10)) == recovered.owner_view(&id(1), &id(10)));
    assert!(k.shared_view(&id(2), &id(10), &id(20)) == recovered.shared_view(&id(2), &id(10), &id(20)));
    let mut corrupt = k.history().to_vec();
    corrupt.push(corrupt[3].clone());
    assert!(matches!(
        Kernel::replay([id(1), id(2), id(3)], &corrupt),
        Err(Rejection::InvalidHistory)
    ));
}

#[test]
fn invalid_recipient_and_reused_share_leave_state_unchanged() {
    let mut k = initial();
    let unknown = command(101, 1, "ShareWork", json!({
        "share_id":id(20), "recipient_id":id(99), "title":"Excerpt",
        "scope_text":"Not delivered", "permission":"view_respond"
    }));
    assert_eq!(k.submit(&id(1), unknown, 2), Err(Rejection::Denied));
    k.submit(&id(1), share(102, 1), 2).unwrap();
    assert_eq!(k.submit(&id(1), share(103, 2), 3), Err(Rejection::DuplicateShare));
    assert_eq!(k.history().len(), 2);
}

#[test]
fn independent_principals_can_create_their_own_world_objects() {
    let mut k = initial();
    let second = Command::parse(&json!({
        "schema_version":"0.1", "command_id":id(100), "work_id":id(11),
        "expected_revision":0, "kind":"CreateWork",
        "payload":{"title":"Independent","body":"Different"}
    }).to_string()).unwrap();
    k.submit(&id(2), second, 2).unwrap();
    assert!(k.owner_view(&id(2), &id(11)).is_some());
    assert!(k.owner_view(&id(1), &id(11)).is_none());
    assert_eq!(k.history().len(), 2);
}
