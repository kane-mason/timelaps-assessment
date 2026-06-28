# Timelaps: Founding Engineer · Technical Exercise

> Faithful markdown transcription of `Timelaps Founding Engineer · Technical Exercise.pdf` (3 pages).
> Source of truth for the assessment. Data files (from repo root): `data/responses_raw.json`, `data/analysed_outputs.json`.

---

Two short parts plus a video. **Take the time you need to do this well. There's no hard time limit.** That said, we value speed and shipping, so **when you turn it around is part of what we notice**: a sharp, well-judged submission that comes back quickly tells us something we care about. Don't read that as "rush it": a half-baked-but-fast piece helps no one, and quality comes first. Equally, don't gold-plate it for days. The right instinct is to scope it well, do that well, and ship. Use whatever tools you'd use on the job, AI agents very much included; we only ask that you understand and can talk through everything you submit.

---

## Brief

### Context

Timelaps runs always-on brand trackers: continuous consumer surveys measuring how brands live in buyers' minds, delivered through an AI-native dashboard. Survey **waves** arrive periodically and are compared wave-on-wave. A core part of our craft is turning survey data into a single, **decision-ready** view a busy marketing leader can act on in seconds.

### What we give you

First, a quick primer, since we don't assume any brand-tracking background.

**What's a brand funnel?** It's the sequence of stages a potential customer moves through with a brand, from first hearing of it to actually using it. Fewer people reach each successive stage, which is why it's pictured as a funnel. We measure three stages, each reported as a **% of all respondents** in a wave:

- **Aware:** has heard of the brand at all.
- **Consider:** would consider buying or using it. A subset of *aware*, since you can't consider a brand you've never heard of.
- **Used:** has actually bought or used it. A subset of *consider*.

So for any brand the numbers only ever shrink down the funnel: `aware ≥ consider ≥ used`. The **shape** is the insight. High awareness but low consideration means people know the brand but aren't sold on it (a messaging/positioning problem); strong consideration but low usage means they're interested but not converting (an availability/price/experience problem). Comparing the funnel **wave-on-wave** shows whether a brand is improving over time; comparing it **against competitors** shows where it stands in the category. That whole story (where a brand is winning, where it's leaking, and how that's changing) is what a marketing leader wants to read in one glance.

Now the two files (synthetic data, no real client involved):

- **`responses_raw.json`:** response-level survey data: one tracked brand (**Aurora**) plus three competitors (Borealis, Cascade, Drift), two waves (Q4 2025, Q1 2026), with each respondent's demographics. Every respondent has an aware / consider / used answer **for each brand**. Because the stages nest, in the raw data `consider` is `null` unless `aware` is `true`, and `used` is `null` unless `consider` is `true`. The survey simply doesn't ask the next question when the previous stage didn't apply. (A `null` therefore means "not asked," which is different from a `false`.)
- **`analysed_outputs.json`:** *some* metrics we've already computed from that raw data (funnel %s per brand/wave, wave deltas, and one age breakdown), with definitions.

**Part of the exercise is deciding which of these to use:** compute what you need from the raw data, lean on our pre-computed outputs, or mix both. There's no single right answer; we want to hear your reasoning in the video.

Note: each wave has a healthy overall base (~250 respondents), so the headline brand funnels are solid. But once you cut the data (by age, say) some cells get thin. Treat any figure computed on a base of **n < 50 respondents** as low-confidence.

---

## Part 1: Build one analysed view *(the bulk of your time)*

Build **one rendered component** (React or plain HTML/CSS, your choice) that shows:

> Where Aurora stands against its competitors (Borealis, Cascade, Drift) on the brand funnel, and how that competitive picture shifted from Q4 2025 to Q1 2026, as one decision-ready screen for a marketing leader.

The comparison *is* the point: show Aurora **relative to its rivals**, not Aurora on its own. A marketing leader needs to see at a glance where Aurora leads, where it trails, and where the gap is opening or closing across the two waves.

That's the *what*. The **how is entirely yours**: chart choice, layout, hierarchy, what to emphasise, what to leave out, how it reads at a glance. This is where we're looking at your design taste and your judgment about what matters. If you spot a secondary insight worth surfacing, your call whether to include it. Restraint is as telling as inclusion.

**Give us a way to see it** with a **live link** (deploy it free to Vercel or Netlify, or share a CodeSandbox/StackBlitz **live-preview** link), or a **single self-contained HTML file** we can open. You're welcome to share the source as well for later, but don't let a repo be the *only* way in. You'll also walk us through it in the video.

---

## Part 2: Design an AI analyst *(thinking first, building optional)*

Using the **same dataset**, describe how you would build an **AI analyst**: a user asks a question in natural language, the analyst goes **back into the data, runs whatever additional analysis is needed to answer it**, and returns a **plain-language answer alongside a data visualization**.

Reason against these two example questions:

1. *"Why did Aurora's consideration move this wave?"*
2. *"Which age group is driving Aurora's growth?"*

We're interested in your **approach**, not code. A page of notes, a diagram, or a few minutes in the video is plenty, and a strong written/spoken design scores full marks here. That said, if you're inspired and have the time, you're welcome to prototype a piece of it, but it's genuinely optional, it won't earn extra credit over a sharp design, and it shouldn't balloon your turnaround. Things worth addressing either way: how the analyst decides what to compute; how it stays **grounded in the actual numbers rather than inventing them**; how it chooses or generates the right visualization; how it handles thin data (those small bases); and where it could go wrong.

---

## The video (5–10 min)

One screen-share walkthrough:

- **Part 1:** what you chose to show and why, which data you used and why, the design decisions behind it.
- **Part 2:** your AI-analyst approach.
- **Closing (~60 sec):** your preferred tech stack and AI tooling, and *why* you reach for them.

## Guidelines

- No fixed time cap: take what you need to do it well. We value a fast, well-judged turnaround and we'll notice it, but quality comes first: don't rush into something sloppy, and don't gold-plate for days. Scoping well is part of the signal.
- AI tools expected; own what you submit.
- You're welcome to contact Henk (henk@timelaps.io) at any time to clarify anything in the exercise.

---

## Quick task summary (not in the PDF — my own index)

| | |
|---|---|
| **Part 1** | One decision-ready component: Aurora vs Borealis/Cascade/Drift on the funnel (aware/consider/used), wave-on-wave shift Q4 2025 → Q1 2026. Deliver as live link or single self-contained HTML. The bulk of the time. |
| **Part 2** | Written/spoken design (code optional) of an AI analyst over the same data — grounding, viz choice, thin-data handling, failure modes. Reason against the 2 example questions. |
| **Video** | 5–10 min screen-share: Part 1 decisions, Part 2 approach, ~60 sec on stack + AI tooling + why. |
| **Data** | `responses_raw.json` (response-level, nested null semantics) + `analysed_outputs.json` (pre-computed funnel %s, deltas, one age breakdown). Choose what to use; justify it. |
| **Key constraints** | `aware ≥ consider ≥ used`; `null` = "not asked" ≠ `false`; treat `n < 50` cells as low-confidence; ~250 base per wave. |
