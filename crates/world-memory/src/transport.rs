//! HTTP-facing route contract. A server adapter still owns TLS, header parsing,
//! body streaming limits, connection limits and a real IdentityVerifier.
//! No listener, credential store, browser session or external call in this module.

use crate::access::{Access, AccessResponse, IdentityVerifier, Request};
use serde_json::json;
use world_language::MAX_COMMAND_BYTES;

/// All responses (including errors) have no-store semantics.
pub const RESPONSE_HEADERS: [(&str, &str); 3] = [
    ("Content-Type", "application/json; charset=utf-8"),
    ("Cache-Control", "no-store"),
    ("X-Content-Type-Options", "nosniff"),
];

/// Only a framework adapter may construct these fields from a parsed HTTP
/// request. The adapter must reject duplicate Authorization/Content-Type
/// headers and malformed framing before dispatch.
pub struct HttpRequest<'a> {
    pub method: &'a str,
    pub path: &'a str,
    pub authorization: Option<&'a str>,
    pub content_type: Option<&'a str>,
    pub body: &'a [u8],
}

fn problem(status: u16, code: &'static str) -> AccessResponse {
    AccessResponse {
        status,
        body: json!({"error":code}),
    }
}

/// The server supplies the recorded time. There is no actor or time query.
pub fn dispatch<V: IdentityVerifier>(
    access: &mut Access<'_, V>,
    request: HttpRequest<'_>,
    recorded_at_ms: u64,
) -> AccessResponse {
    let Some(credential) = request
        .authorization
        .and_then(|header| header.strip_prefix("Bearer "))
        .filter(|value| {
            !value.is_empty()
                && value.len() <= 16_384
                && value.bytes().all(|b| b.is_ascii_graphic())
        })
    else {
        return problem(401, "unauthenticated");
    };
    if request.path.len() > 256 || request.path.contains(['?', '#', '%']) {
        return problem(404, "not_found");
    }
    if request.body.len() > MAX_COMMAND_BYTES {
        return problem(413, "request_too_large");
    }
    let route = match (request.method, request.path) {
        ("GET", "/v1/arrival") if request.body.is_empty() => Request::Arrival,
        ("POST", "/v1/commands" | "/v1/replies") => {
            if request.content_type != Some("application/json") {
                return problem(415, "unsupported_media_type");
            }
            let Ok(raw) = std::str::from_utf8(request.body) else {
                return problem(400, "invalid_request");
            };
            if request.path == "/v1/commands" {
                Request::OwnerCommand(raw)
            } else {
                Request::ScopedReply(raw)
            }
        }
        ("GET", path) if request.body.is_empty() => {
            let parts: Vec<_> = path.split('/').collect();
            match parts.as_slice() {
                ["", "v1", "works", work] => Request::OwnerExpression(work),
                ["", "v1", "works", work, "disclosures", share] => {
                    Request::SharedExpression { work, share }
                }
                _ => return problem(404, "not_found"),
            }
        }
        _ => return problem(404, "not_found"),
    };
    access.handle(credential, route, recorded_at_ms)
}
