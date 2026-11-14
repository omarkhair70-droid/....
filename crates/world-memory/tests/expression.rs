use serde_json::json;
use world_kernel::{OwnerShareView, OwnerView, ResponseView, SharedView};
use world_language::{Id, Response};
use world_memory::expression;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn share() -> SharedView {
    SharedView {
        share_id: id(20),
        snapshot_revision: 1,
        title: "جزء مشترك".into(),
        scope_text: "Can we discuss?".into(),
        responses: vec![],
    }
}

fn owner() -> OwnerView {
    OwnerView {
        work_id: id(10),
        revision: 2,
        title: "عمل".into(),
        body: "Private original".into(),
        shares: vec![OwnerShareView {
            recipient_id: id(2),
            revoked: false,
            disclosed: share(),
        }],
    }
}

#[test]
fn meaning_changes_without_replacing_work_identity() {
    let mut view = owner();
    let before = expression::owner(&view);
    view.revision = 3;
    view.body = "Private change".into();
    let after = expression::owner(&view);
    assert_eq!(before["subject"], after["subject"]);
    assert_eq!(before["title"], after["title"]);
    assert_eq!(before["disclosures"][0]["text"], after["disclosures"][0]["text"]);
    assert_ne!(before["text"], after["text"]);
    assert_eq!(after["actions"][0]["expected_revision"], 3);
}

#[test]
fn participant_expression_does_not_depend_on_private_revision() {
    let mut view = owner();
    let before = expression::shared(&view.shares[0].disclosed);
    view.revision = 20;
    view.body = "Secret changed".into();
    let after = expression::shared(&view.shares[0].disclosed);
    assert_eq!(before, after);
    assert!(after.get("revision").is_none());
    assert!(after.get("disclosures").is_none());
    assert!(!after.to_string().contains("Secret"));
    assert_eq!(
        after["actions"],
        json!([{"kind":"respond_to_disclosure","share_id":id(20),"snapshot_revision":1}])
    );
}

#[test]
fn human_responses_append_without_rewriting_previous_meaning() {
    let mut view = share();
    view.responses.push(ResponseView {
        snapshot_revision: 1,
        response: Response::InterestedInDiscussion,
        comment: None,
        recorded_at_ms: 10,
    });
    let before = expression::shared(&view);
    view.responses.push(ResponseView {
        snapshot_revision: 1,
        response: Response::Decline,
        comment: Some("Not now".into()),
        recorded_at_ms: 20,
    });
    let after = expression::shared(&view);
    assert_eq!(before["subject"], after["subject"]);
    assert_eq!(before["responses"][0], after["responses"][0]);
    assert_eq!(after["responses"][1]["ordinal"], 1);
    assert_eq!(after["responses"][1]["kind"], "decline");
    assert_eq!(after["responses"][0]["kind"], "interested_in_discussion");
}

#[test]
fn revoked_disclosure_is_history_not_an_available_action() {
    let mut view = owner();
    view.shares[0].revoked = true;
    let value = expression::owner(&view);
    assert_eq!(value["disclosures"][0]["access"], "revoked");
    assert_eq!(value["disclosures"][0]["actions"], json!([]));
    assert_eq!(value["disclosures"][0]["snapshot_revision"], 1);
}
