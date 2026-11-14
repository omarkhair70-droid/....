use std::collections::BTreeSet;
use world_composition::knowledge::Source;
use world_composition::retrieval::{Corpus, Error, Grants, IdentityHint, IdentityQuery};
use world_language::Id;

fn id(n: u64) -> Id {
    Id::parse(&format!("00000000-0000-4000-8000-{n:012x}")).unwrap()
}

fn source(n: u64, text: &str) -> Source {
    Source {
        id: id(n),
        revision: 1,
        scope: id(1),
        locator: format!("synthetic:{n}"),
        acquired_at_ms: 10,
        text: text.into(),
    }
}

fn grants(ids: &[u64]) -> Grants {
    Grants {
        scope: id(1),
        versions: ids.iter().map(|n| (id(*n), 1)).collect::<BTreeSet<_>>(),
    }
}

#[test]
fn bilingual_search_preserves_exact_source_bytes_and_order() {
    let a = source(10, "أَعْمَال مشتركة Engineering");
    let b = source(11, "engineering");
    let grants = grants(&[10, 11]);
    let corpus = Corpus::new(&grants, vec![b, a.clone()]).unwrap();
    let result = corpus.search(&grants, "اعمال ENGINEERING", 2).unwrap();
    assert_eq!(result.hits.len(), 2);
    let best = &result.hits[0];
    assert_eq!(best.matched_terms, 2);
    assert_eq!(best.citation.source, id(10));
    assert_eq!(best.citation.excerpt, a.text[best.citation.start..best.citation.end]);
    assert!(!result.limited);
    let short = corpus.search(&grants, "engineering", 1).unwrap();
    assert!(short.limited);
    assert_eq!(short.hits[0].citation.source, id(10));
}

#[test]
fn revoked_sources_do_not_affect_visible_results_or_limit() {
    let all = grants(&[10, 11]);
    let only = grants(&[11]);
    let a = source(10, "private common");
    let b = source(11, "visible common");
    let corpus = Corpus::new(&all, vec![a, b.clone()]).unwrap();
    let fresh = Corpus::new(&only, vec![b]).unwrap();
    assert_eq!(
        corpus.search(&only, "common", 1).unwrap(),
        fresh.search(&only, "common", 1).unwrap()
    );
    assert!(corpus.search(&only, "private", 1).unwrap().hits.is_empty());
}

#[test]
fn long_unicode_sources_return_valid_bounded_original_spans() {
    let text = format!("{} engineering {}", "ع".repeat(1500), "ب".repeat(1500));
    let s = source(10, &text);
    let grant = grants(&[10]);
    let corpus = Corpus::new(&grant, vec![s]).unwrap();
    let hit = corpus.search(&grant, "engineering", 4).unwrap().hits.pop().unwrap();
    assert!(hit.citation.excerpt.len() <= 2048);
    assert_eq!(hit.citation.excerpt, text[hit.citation.start..hit.citation.end]);
}

#[test]
fn name_and_exact_identifier_conflicts_never_merge_entities() {
    let all = grants(&[10, 11]);
    let only = grants(&[11]);
    let mut corpus = Corpus::new(
        &all,
        vec![source(10, "شركة الأفق"), source(11, "شركة الافق")],
    ).unwrap();
    for hit in corpus.search(&all, "الافق", 4).unwrap().hits {
        let entity = if hit.citation.source == id(10) { id(100) } else { id(101) };
        corpus.add_hint(&all, IdentityHint {
            entity,
            scope: id(1),
            name: hit.citation.excerpt.clone(),
            identifier: Some(("registry:synthetic".into(), "123".into())),
            citation: hit.citation,
        }).unwrap();
    }
    let result = corpus.identify(&all, IdentityQuery::Name("شركة الافق")).unwrap();
    assert_eq!(result.entity_ids, vec![id(100), id(101)]);
    let exact = corpus.identify(&all, IdentityQuery::Identifier {
        namespace: "registry:synthetic", value: "123",
    }).unwrap();
    assert_eq!(result.entity_ids, exact.entity_ids);
    let visible = corpus.identify(&only, IdentityQuery::Name("شركة الافق")).unwrap();
    assert_eq!(visible.entity_ids, vec![id(101)]);
    assert_eq!(visible.hints.len(), 1);
}

#[test]
fn invalid_source_or_fabricated_identity_excerpt_is_rejected() {
    let all = grants(&[10]);
    assert!(matches!(Corpus::new(&all, vec![source(11, "hidden")]), Err(Error::Denied)));
    assert!(matches!(
        Corpus::new(&all, vec![source(10, "a"), source(10, "b")]),
        Err(Error::Duplicate)
    ));
    let mut corpus = Corpus::new(&all, vec![source(10, "name")]).unwrap();
    let mut citation = corpus.search(&all, "name", 1).unwrap().hits.pop().unwrap().citation;
    citation.excerpt = "fake".into();
    assert_eq!(corpus.add_hint(&all, IdentityHint {
        entity: id(100), scope: id(1), name: "name".into(), identifier: None, citation,
    }), Err(Error::Invalid));
    let mut foreign = grants(&[10]);
    foreign.scope = id(2);
    assert_eq!(corpus.search(&foreign, "name", 1), Err(Error::Scope));
    assert_eq!(corpus.search(&all, "!", 1), Err(Error::Invalid));
    assert_eq!(corpus.search(&all, "name", 0), Err(Error::Capacity));
}
