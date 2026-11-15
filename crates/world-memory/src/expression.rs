//! Semantic expression of authorized views, independent of visual layout.
//! No access to the full world, raw history, source archives or model output.
//! Action descriptions are not capability tokens; the kernel reauthorizes.

use serde_json::{Value, json};
use world_kernel::{OwnerView, SharedView};

/// An owner expression retains the work identity across revisions. The
/// renderer may choose a different spatial arrangement without changing meaning.
pub fn owner(view: &OwnerView) -> Value {
    let disclosures: Vec<_> = view
        .shares
        .iter()
        .map(|share| {
            let actions = if share.revoked {
                json!([])
            } else {
                json!([{
                    "kind":"prepare_revocation",
                    "share_id":share.disclosed.share_id,
                    "expected_revision":view.revision
                }])
            };
            json!({
                "subject":{"kind":"disclosure","id":share.disclosed.share_id},
                "recipient_id":share.recipient_id,
                "access":if share.revoked {"revoked"} else {"active"},
                "snapshot_revision":share.disclosed.snapshot_revision,
                "title":share.disclosed.title,
                "text":share.disclosed.scope_text,
                "responses":responses(&share.disclosed),
                "actions":actions
            })
        })
        .collect();
    json!({
        "version":"0.1",
        "subject":{"kind":"work","id":view.work_id},
        "revision":view.revision,
        "title":view.title,
        "text":view.body,
        "disclosures":disclosures,
        "actions":[
            {"kind":"edit_work","expected_revision":view.revision},
            {"kind":"prepare_disclosure","expected_revision":view.revision}
        ]
    })
}

/// Only the active, recipient-authorized SharedView may reach this function.
/// No owner aggregate revision, other disclosures or private body is emitted.
/// The share ID is local to the already-authorized work route.
pub fn shared(view: &SharedView) -> Value {
    json!({
        "version":"0.1",
        "subject":{"kind":"disclosure","id":view.share_id},
        "snapshot_revision":view.snapshot_revision,
        "title":view.title,
        "text":view.scope_text,
        "responses":responses(view),
        "actions":[{
            "kind":"respond_to_disclosure",
            "share_id":view.share_id,
            "snapshot_revision":view.snapshot_revision
        }]
    })
}

/// Within one immutable share, responses are append-only and ordered by
/// admission. Scoped ordinal is stable across appends; it is not a global ID.
/// A future durable response ID is required before editing/deleting responses.
fn responses(view: &SharedView) -> Vec<Value> {
    view.responses
        .iter()
        .enumerate()
        .map(|(ordinal, response)| {
            json!({
                "ordinal":ordinal,
                "snapshot_revision":response.snapshot_revision,
                "kind":response.response,
                "comment":response.comment,
                "recorded_at_ms":response.recorded_at_ms
            })
        })
        .collect()
}
