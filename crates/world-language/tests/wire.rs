use serde_json::{Value, json};
use world_language::{Command, Id, MAX_COMMAND_BYTES};

fn create() -> Value {
    json!({
        "schema_version":"0.1",
        "command_id":"00000000-0000-4000-8000-000000000001",
        "work_id":"00000000-0000-4000-8000-000000000002",
        "expected_revision":0,
        "kind":"CreateWork",
        "payload":{"title":"عمل","body":"نص"}
    })
}

#[test]
fn contract_fixtures() {
    let fixtures: Value =
        serde_json::from_str(include_str!("../../../contracts/v0.1/fixtures.json")).unwrap();
    for case in fixtures["cases"].as_array().unwrap() {
        let raw = serde_json::to_string(&case["command"]).unwrap();
        let command = Command::parse(&raw);
        assert_eq!(
            command.is_ok(),
            case["valid"].as_bool().unwrap(),
            "{}",
            case["name"]
        );
        if let Ok(command) = command {
            let roundtrip = Command::parse(&command.to_json().unwrap()).unwrap();
            assert!(roundtrip == command);
        }
    }
}

#[test]
fn duplicate_keys_are_rejected_before_json_mapping() {
    let raw = create().to_string();
    let envelope = raw.replacen(
        "\"schema_version\":\"0.1\"",
        "\"schema_version\":\"0.1\",\"schema_version\":\"0.1\"",
        1,
    );
    let payload = raw.replacen(
        "\"title\":\"عمل\"",
        "\"title\":\"عمل\",\"title\":\"آخر\"",
        1,
    );
    assert_ne!(envelope, raw);
    assert_ne!(payload, raw);
    assert!(Command::parse(&envelope).is_err());
    assert!(Command::parse(&payload).is_err());
}

#[test]
fn explicit_null_comment_is_not_an_optional_absence() {
    let mut value = create();
    value["kind"] = json!("RespondToShare");
    value["expected_revision"] = json!(2);
    value["payload"] = json!({
        "share_id":"00000000-0000-4000-8000-000000000003",
        "snapshot_revision":1,
        "response":"decline",
        "comment":null
    });
    assert!(Command::parse(&value.to_string()).is_err());
}

#[test]
fn unicode_scalar_limits_and_integer_boundary() {
    let mut value = create();
    value["payload"]["title"] = json!("ة".repeat(240));
    assert!(Command::parse(&value.to_string()).is_ok());
    value["payload"]["title"] = json!("ة".repeat(241));
    assert!(Command::parse(&value.to_string()).is_err());
    value = create();
    value["expected_revision"] = json!(0.0);
    assert!(Command::parse(&value.to_string()).is_err());
    assert!(Command::parse(&" ".repeat(MAX_COMMAND_BYTES + 1)).is_err());
}

#[test]
fn ids_are_canonical_lowercase_opaque_strings() {
    assert!(Id::parse("01234567-89ab-cdef-0123-456789abcdef").is_ok());
    assert!(Id::parse("01234567-89AB-CDEF-0123-456789abcdef").is_err());
}
