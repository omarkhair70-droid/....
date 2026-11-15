//! Counterfactual temporal interventions on an existing formation.
//! Not a schedule, permission, reservation, evidence update, or commitment.
use super::{Error, FormationKey, Goal, Offer, Slot, Window};
use world_language::{Id, MAX_REVISION};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Origin {
    ProposedWork,
    Contribution { slot: Id, offer: Id },
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Boundary {
    pub at_ms: u64,
    pub origins: Vec<Origin>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Interval {
    pub latest_start: Boundary,
    pub earliest_end: Boundary,
    pub overlap: Option<Window>,
    pub available_ms: u64,
    pub fits: bool,
    pub shortfall_ms: u64,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Preview {
    /// The exact original formation, not a new canonical candidate.
    pub base: FormationKey,
    pub original_window: Window,
    pub original_minimum_duration_ms: u64,
    pub requested_window: Window,
    pub requested_minimum_duration_ms: u64,
    pub before: Interval,
    pub after: Interval,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub(super) struct Basis {
    goal: Window,
    duration: u64,
    contributions: Vec<(Origin, Window)>,
}

impl Basis {
    pub(super) fn new(goal: &Goal, slots: &[&Slot], offers: &[&Offer]) -> Self {
        Self {
            goal: goal.window,
            duration: goal.minimum_duration_ms,
            contributions: slots
                .iter()
                .zip(offers)
                .map(|(slot, offer)| {
                    (
                        Origin::Contribution {
                            slot: slot.id.clone(),
                            offer: offer.id.clone(),
                        },
                        offer.window,
                    )
                })
                .collect(),
        }
    }

    pub(super) fn preview(
        &self,
        base: &FormationKey,
        window: Window,
        duration: u64,
    ) -> Result<Preview, Error> {
        // A valid window shorter than the requested duration is meaningful:
        // show a shortfall rather than silently relaxing the constraint.
        if !window.valid() || !(1..=MAX_REVISION).contains(&duration) {
            return Err(Error::InvalidValue);
        }
        Ok(Preview {
            base: base.clone(),
            original_window: self.goal,
            original_minimum_duration_ms: self.duration,
            requested_window: window,
            requested_minimum_duration_ms: duration,
            before: self.interval(self.goal, self.duration),
            after: self.interval(window, duration),
        })
    }

    fn interval(&self, window: Window, duration: u64) -> Interval {
        let mut start = Boundary {
            at_ms: window.start_ms,
            origins: vec![Origin::ProposedWork],
        };
        let mut end = Boundary {
            at_ms: window.end_ms,
            origins: vec![Origin::ProposedWork],
        };
        for (origin, contribution) in &self.contributions {
            if contribution.start_ms > start.at_ms {
                start.at_ms = contribution.start_ms;
                start.origins.clear();
            }
            if contribution.start_ms == start.at_ms {
                start.origins.push(origin.clone());
            }
            if contribution.end_ms < end.at_ms {
                end.at_ms = contribution.end_ms;
                end.origins.clear();
            }
            if contribution.end_ms == end.at_ms {
                end.origins.push(origin.clone());
            }
        }
        let available_ms = end.at_ms.saturating_sub(start.at_ms);
        let overlap = (available_ms > 0).then_some(Window {
            start_ms: start.at_ms,
            end_ms: end.at_ms,
        });
        Interval {
            latest_start: start,
            earliest_end: end,
            overlap,
            available_ms,
            fits: available_ms >= duration,
            shortfall_ms: duration.saturating_sub(available_ms),
        }
    }
}
