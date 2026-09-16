# Product Requirements Document (PRD)

## 1. Project Overview & Intent

The objective is to build a micro-utility mobile/progressive web application designed to solve a hyper-specific personal finance leak: the chronic forgetting of cash change during routine shop transactions.

The target user rotates heavily between the same three local shops which sell near-identical commodity items (e.g., Bread, Milk, Soda, Indomie). The primary behavioral roadblock is friction: traditional tracking tools (like spreadsheets or complex manual budgeting apps) demand too many form fields, leading to immediate user abandonment.

The goal of this application is to capture exact transaction variables in under 15 seconds using a highly visual, simulation-style tap matrix, completely bypassing manual text entry while removing the burden of recollection from the user's memory.

---

## 2. Core Problem Statements

- **The Log Friction:** Traditional data entry forces users to type store names, dates, items, and figures. If logging a transaction takes longer than 30–60 seconds, the user will mentally defer it ("I'll do it later") and ultimately abandon the record entirely.

- **The Fluctuation Factor:** Relying on pre-programmed product catalogs or price sheets creates a maintenance trap. Because item prices constantly fluctuate due to inflation, forcing the user to manually update a menu price within settings introduces unacceptable workflow friction.

- **The Partial Change Nuance:** Shopkeepers often run out of specific lower-denomination notes. They will frequently pay back part of the change (e.g., handing back ₦200 out of ₦300 owed) and ask the customer to return later for the remaining balance.

- **The Merchant Confrontation (Accountability Dispute):** When returning to collect a tab days later, shopkeepers require the exact context of the transaction to verify their internal ledger or daily cash reconciliation. If the user cannot remember the exact permutation of what they bought, the bill note they handed over, and what part-change was returned, the vendor will dispute the claim.

---

## 3. Desired Product Functionality & Workflows

### Phase 1: One-Time Quick Presets

The app must provide a dead-simple setup screen where the user inputs their Top 3 Shops and a single master list of their Top 5-6 Frequently Purchased Items (which apply universally across all three shops). No price values are tied to these items during setup.

### Phase 2: The Simulation-Style Data Entry Flow

When walking away from a transaction with uncollected change, the user must be able to log the event using a rapid, sequential matrix of taps. Zero manual keyboard typing is permitted.

The step-by-step entry wizard must follow this exact functional sequence:

1. **Select Location:** Tap one of the 3 large preset shop buttons.
2. **Select Item:** Tap one item from the universal frequent-purchases list (e.g., [Bread]).
3. **Log Total Price:** Input the exact cost of the item that day using a rapid UI element (like a smart scrolling dial, a responsive number grid, or dynamic increments).
4. **Log Handed Cash:** Tap cards or buttons representing the physical currency handed over. The UI must specifically anchor to the Nigerian Naira (₦) currency, using a grid configuration composed strictly of these physical denominations: ₦1,000, ₦500, ₦200, ₦100, and ₦50. Multi-note inputs must stack incrementally (e.g., handing over ₦2,000 is logged by tapping the ₦1,000 button twice, not via a non-existent ₦2,000 note button).
5. **Log Cash Returned:** Tap a section indicating what happened to the change. The user can either tap [Nothing Received] or quickly select the specific Naira notes from the same denomination grid that the vendor did manage to hand back as partial change.

### Phase 3: The Active Balance Engine

The core database must ingest these raw integers and immediately compute the definitive missing balance using an internal calculation:

$$\text{Owed Balance} = \text{Cash Handed Over} - \text{Item Price Value} - \text{Partial Cash Returned}$$

This calculated value must be aggregated and assigned dynamically to the respective shop's ledger account.

### Phase 4: Automated "Receipt Story" Generator

The app must act as an explicit communication layer between the user and the vendor. When looking at a specific shop's profile within the app, it should present a **Debrief Card**. This card translates the raw ledger data into a clear, conversational human script that the user can read word-for-word to the merchant.

The system must automatically format the script to state:

- The exact, aggregated cash balance currently owed.
- A concise breakdown of the event context (e.g., "I bought Bread for ₦300 on Monday afternoon. I handed you two ₦1,000 notes, and you only had a ₦500 note to return to me at the time. You are holding the ₦1,200 balance.").
- A prominent verification tool to flag the transaction as "Settled", wiping the entry or marking it paid once the merchant returns the cash or applies it as credit.

---

## 4. User Experience & Behavioral Mandates

- **The "Guilt-Driven" Dashboard:** The home view of the interface should act as a high-visibility psychological trigger. It must visually anchor uncollected money across the shops so that the aggregate total forces the user to take action upon approaching the stores.

- **Passive Proximity Awareness:** The application should leverage lightweight location boundaries or geofencing triggers. When the user passes within close physical proximity of one of the top three saved shops, a system-level notification should fire actively reminding them of the precise amount owed at that storefront before they walk inside.

- **The "One-Off" Escape Valve:** A secondary, isolated trigger (e.g., a "Random/One-Off Shop" tray) should exist at the bottom of the interface. This bypasses the rigid 3-shop matrix, activating a quick audio memo or raw single-digit entry tool for outlier shops the user rarely visits, keeping the primary workspace completely clean.

---

## 5. App Name & Identity Concept

- **Project Working Name:** ChangeHold
- **Concept Style:** Simple, descriptive, and direct. Avoids overly technical jargon, futuristic financial buzzwords, or robotic terminology. The interface should feel like an organic extension of a fast-paced physical transaction, focusing purely on keeping track of what is physically left behind.
