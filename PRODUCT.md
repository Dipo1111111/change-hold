# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person on their own phone. No accounts, no sharing, no multi-device. The same user who walks away from a shop counter leaving change behind.

## Product Purpose

ChangeHold is a micro-utility for one specific leak: forgotten cash change left at the same few local shops. It logs a transaction in under 15 seconds with taps only — never a keyboard — so recording happens at the moment of leaving the counter, not later from memory. Success is the user collecting money that would otherwise stay at the shop.

## Positioning

The balance is a written claim the vendor can't dispute. Instead of a personal finance tracker, ChangeHold is a tap-built receipt you can read word-for-word back to the shopkeeper ("I bought Bread for ₦300, handed you two ₦1,000, you had ₦1,200 of it") so reconciliation stops being an argument about memory.

## Operating Context

- Used on a phone, PWA, single hand. Sometimes standing at a shopfront in bright Lagos daylight; sometimes indoors, in the car, or in a dim room. Both extremes are real scenes — the interface must stay legible and high-contrast in both.
- Captured while walking away, in seconds, often with the change in hand.
- Education/expectation is none: a shop visitor must complete the log with taps only (no typing anywhere in the core flow).
- Nigerian naira denominations in play: ₦1000, ₦500, ₦200, ₦100, ₦50. Prices fluctuate daily — the app never stores prices for items, only what each transaction cost that day.

## Capabilities and Constraints

- Preserve the full built functionality: setup of top-3 shops + universal frequent-items list (no prices attached); 6-step tap wizard (shop → item → price numpad → handed notes → returned notes/mode → review story + save); balance engine (owed = handed − price − returned) aggregated per shop; per-shop debrief "story" cards to read to the vendor; settle/delete per transaction; guilt-driven dashboard total; one-off shop tray with optional voice memo; geofence notifications within ~300m of a shop that owes money when a shop location is saved.
- Pure client-side: localStorage state, IndexedDB for audio memos, zero dependencies, works served or offline via service worker.
- No keyboard entry in the log wizard. Voice memo uses MediaRecorder. Geofence uses watchPosition.
- Terminology in use: change (owed balance), handed (notes given), returned (notes back), settled.

## Brand Commitments

- Name: ChangeHold. Voice: plain, direct, organic — like an extension of a fast physical transaction. No fintech jargon, no debt-shaming guilt rhetoric in the product's own words (the pressure is visual, not verbal).
- Existing light copy is evidence of voice: "they are holding ₦1,200", "logged — go collect", "sha you collect am o" (settle toast), "Yes yorá." Informal Nigerian English is accepted seasoning.

## Evidence on Hand

- PRD.md in this repo (product intent, workflows, behavioral mandates).
- Incumbent implementation in this repo (js/*, styles.css, index.html): working PWA with the full feature set and a jsdom test harness (in the temp dir).
- No real user data, testimonials, screenshots, or brand assets exist yet; synthetic demo data in UI must be labeled only where it could be mistaken for the user's real data.

## Product Principles

1. Capture beats recollection: logging must be faster than forgetting, so input is taps only and never interrupts walking away.
2. The vendor's bookkeeping is the enemy to arm against: every record must read back as a concrete, checkable story — exact item, price, notes handed, notes returned.
3. Skeptic-proof equals settled: a transaction is done when it's marked settled or the balance is zero; nothing ambiguous stays open.
4. Prices move, habits don't: the app tracks recurring shops and items, never price catalogs.
5. Pressure is visual, never verbal: the owed total should pull the eye; the words stay calm and human.

## Accessibility & Inclusion

No product-specific standard was set. The scene demands high contrast and comfortable tap targets for one-handed outdoor use, and the redesign must keep text/background contrast ≥4.5:1 (≥3:1 large text) including under bright daylight.