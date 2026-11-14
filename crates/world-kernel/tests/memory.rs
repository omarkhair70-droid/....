use serde_json::{Value, json};
use world_kernel::{Kernel, Recorded, Rejection};
use world_language::{Command, Id, ScopedReply};

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

fn initial() -> Kernel {
    let mut k = Kernel::new([id(1), id(2), id(3)]);
    k.submit(
        &id(1),
        command(100, 0, "CreateWork", json!({"title":"Original","body":"Private"})),
        1,
    )
    .unwrap();
    k.submit(
        &id(1),
        command(
            101,
            1,
            "ShareWork",
            json!({
                "share_id":id(20), "recipient_id":id(2), "title":"Excerpt",
                "scope_text":"Can we discuss?", "permission":"view_respond"
            }),
        ),
        2,
    )
    .unwrap();
    k
}

fn revise(k: &mut Kernel) {
    k.submit(
        &id(1),
        command(102, 2, "ReviseWork", json!({"title":"Revised","body":"Private change"})),
        3,
    )
    .unwrap();
}

fn reply(n: u64, snapshot: u64, response: &str) -> ScopedReply {
    ScopedReply::parse(
        &json!({
            "schema_version":"0.1",
            "command_id":id(n),
            "work_id":id(10),
            "payload":{
                "share_id":id(20), "snapshot_revision":snapshot, "response":response
            }
        })
        .to_string(),
    )
    .unwrap()
}

#[test]
fn private_revision_does_not_change_recipient_acknowledgement() {
    let mut a = initial();
    let mut b = initial();
    revise(&mut b);
    let r = reply(110, 1, "interested_in_discussion");
    let receipt_a = a.respond(&id(2), &r, 4).unwrap();
    let receipt_b = b.respond(&id(2), &r, 4).unwrap();
    assert_eq!(receipt_a, receipt_b);
    assert!(a.shared_view(&id(2), &id(10), &id(20)) == b.shared_view(&id(2), &id(10), &id(20)));
    assert_eq!(a.owner_view(&id(1), &id(10)).unwrap().revision, 3);
    assert_eq!(b.owner_view(&id(1), &id(10)).unwrap().revision, 4);
}

#[test]
fn scoped_retry_is_stable_and_revocation_is_authoritative() {
    let mut k = initial();
    let r = reply(110, 1, "interested_in_discussion");
    revise(&mut k);
    assert_eq!(k.respond(&id(3), &r, 4), Err(Rejection::Denied));
    assert_eq!(k.respond(&id(2), &reply(111, 3, "decline"), 4), Err(Rejection::WrongSnapshot));
    let before = k.respond(&id(2), &r, 4).unwrap();
    assert_eq!(k.respond(&id(2), &r, 5).unwrap(), before);
    assert_eq!(k.respond(&id(2), &reply(110, 1, "decline"), 5), Err(Rejection::CommandCollision));
    k.submit(
        &id(1),
        command(112, 4, "RevokeShare", json!({"share_id":id(20)})),
        6,
    )
    .unwrap();
    assert_eq!(k.respond(&id(2), &r, 7), Err(Rejection::Denied));
    assert!(k.shared_view(&id(2), &id(10), &id(20)).is_none());
    assert_eq!(k.history().len(), 5);
}

#[test]
fn versioned_records_round_trip_and_replay_after_serialization() {
    let mut k = initial();
    revise(&mut k);
    k.respond(&id(2), &reply(110, 1, "request_change"), 4).unwrap();
    let encoded: Vec<_> = k.history().iter().map(|record| record.to_json().unwrap()).collect();
    let decoded: Vec<_> = encoded.iter().map(|raw| Recorded::parse(raw).unwrap()).collect();
    let mut recovered = Kernel::replay([id(1), id(2), id(3)], &decoded).unwrap();
    assert!(k.owner_view(&id(1), &id(10)) == recovered.owner_view(&id(1), &id(10)));
    assert!(k.shared_view(&id(2), &id(10), &id(20)) == recovered.shared_view(&id(2), &id(10), &id(20)));
    let receipt = recovered.respond(&id(2), &reply(110, 1, "request_change"), 50).unwrap();
    assert_eq!(receipt.snapshot_revision, 1);
    assert_eq!(recovered.history().len(), 4);
}

#[test]
fn corrupted_envelopes_and_inconsistent_history_are_rejected() {
    let k = initial();
    let raw = k.history()[0].to_json().unwrap();
    let mut value: Value = serde_json::from_str(&raw).unwrap();
    value["accepted_revision"] = json!(2);
    assert!(Recorded::parse(&value.to_string()).is_err());
    value = serde_json::from_str(&raw).unwrap();
    value["record_version"] = json!("9.9");
    assert!(Recorded::parse(&value.to_string()).is_err());
    let duplicate = raw.replacen("\"record_version\":\"0.1\"", "\"record_version\":\"0.1\",\"record_version\":\"0.1\"", 1);
    assert_ne!(raw, duplicate);
    assert!(Recorded::parse(&duplicate).is_err());
    let mut records = k.history().to_vec();
    records.reverse();
    assert!(Kernel::replay([id(1), id(2), id(3)], &records).is_err());
}

#[test]
fn scoped_wire_cannot_expose_or_require_aggregate_revision() {
    let mut value = json!({
        "schema_version":"0.1", "command_id":id(110), "work_id":id(10),
        "payload":{"share_id":id(20),"snapshot_revision":1,"response":"decline"}
    });
    assert!(ScopedReply::parse(&value.to_string()).is_ok());
    value["expected_revision"] = json!(2);
    assert!(ScopedReply::parse(&value.to_string()).is_err());
    value.as_object_mut().unwrap().remove("expected_revision");
    value["actor_id"] = json!(2);
    assert!(ScopedReply::parse(&value.to_string()).is_err());
}
