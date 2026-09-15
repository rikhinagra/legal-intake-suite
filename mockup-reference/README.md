# Legal Intake & Case Management Suite

A 3-tier web application built to mirror the design and intake workflow of [kr-intake.vercel.app](https://kr-intake.vercel.app/), connecting prospective clients, intake call agents, and law firm attorneys.

---

## 📁 Pages Included

### 1. [index.html](file:///Users/anandkumar/.gemini/antigravity/scratch/legal-intake-suite/index.html) — User Intake Form
- **Audience**: Prospective claimants / direct online intake.
- **Features**:
  - Direct 1:1 UI design clone of `kr-intake.vercel.app` (soft `#FAFAFA` palette, card containers, section icons, clean input controls).
  - **Basic Lead Info**: Case type, occupation, attorney status, answering agent.
  - **Contact Details**: First/last name, phone, email, best time to call, state, city, ZIP, street address.
  - **Accident Details**: Accident date picker, time selector (hour, min, AM/PM), narrative description.
  - **Injured People**: Dynamic `+ Add person` system with personal injury descriptions and removal.
  - **Additional Information**: Insurance policy, claim number, witness details.
  - Instant validation and submission into `localStorage` (`LegalStore`).

### 2. [agent-review.html](file:///Users/anandkumar/.gemini/antigravity/scratch/legal-intake-suite/agent-review.html) — Agent Verification & Call Notes
- **Audience**: Intake agents conducting telephone screening ("after calling").
- **Features**:
  - **Lead Selector**: Switch between incoming leads or preloaded mock leads with live status pills.
  - **Claimant Dossier**: Clean snapshot of claimant demographics, accident story, and listed injuries.
  - **Interactive Call Timer**: Simulate dialing claimant, live minute/second counter, auto-fills duration.
  - **Authenticity Audit Checklist**: 5-point verification (Identity match, SOL compliance, No prior attorney, Documented medical treatment, Clear liability).
  - **Authenticity Verdict**: Mark as *Genuine & Authentic*, *Needs Follow-Up*, or *Flagged / Rejected*.
  - **Agent Post-Call Message**: Textarea with quick snippet inserts for summarizing the phone conversation, client credibility, and attorney instructions.

### 3. [law-dashboard.html](file:///Users/anandkumar/.gemini/antigravity/scratch/legal-intake-suite/law-dashboard.html) — Law Firm Command Center
- **Audience**: Attorneys, partners, and case managers.
- **Features**:
  - **KPI Metrics**: Total Leads, Authentic Certified Leads, Pending Review, High Priority, Retained.
  - **Search & Filters**: Search by claimant name/phone, filter by authenticity verdict and priority.
  - **Cases Table**: At-a-glance status, agent verification badge, and post-call message excerpt.
  - **Interactive Dossier Modal**: Complete client record, accident description, full agent telephone audit trail, and print/PDF view.
  - **Firm Actions**: Retain client, assign attorney, request police/medical records, and record internal notes.
  - **Export CSV**: One-click export of all intake records.

---

## 🚀 How to Run & Test
Open any of the files in your preferred browser:
- `open index.html`
- `open agent-review.html`
- `open law-dashboard.html`

All three pages share a global top navigation bar and real-time `localStorage` store, enabling you to submit a form on Page 1, verify it on Page 2, and inspect it on Page 3!
