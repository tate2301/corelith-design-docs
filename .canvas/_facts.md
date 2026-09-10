# Canonical facts — every artboard must agree with this file

Written to resolve contradictions found in review. Where an artboard disagrees,
the artboard is wrong. Today is **10 September 2026**.

## Corelith (the ERP side)

**Rate of the day** — ZWG 33.5500 per US$, set centrally at 06:00. Any ZWG figure
is its US$ figure × 33.5500 and carries the rate beside it. A stamped rate always
carries the date it was set; do not reuse 33.5500 on a date other than 10 Sep 2026.

**Trade accounts**

| Account | No. | Site | Balance | Ageing | Terms | Limit | Status |
|---|---|---|---|---|---|---|---|
| The Gate Shops | ACC-0142 | Avondale | US$5,420.00 | 30 d | Net 30 | US$8,000.00 | Trading |
| Huchu Mine | ACC-0188 | Bulawayo | US$10,120.00 | 71 d | 45 days | US$20,000.00 | Overdue |
| Lux Liquor | ACC-0203 | Msasa | US$1,105.75 | 62 d | Net 30 | US$4,000.00 | Overdue |
| Avondale Pharmacy | ACC-0219 | Avondale | US$2,860.00 | 14 d | 30 days | US$5,000.00 | Trading |
| Nyanga Lodge | ACC-0224 | Mutare | US$1,280.30 | 8 d | Net 30 | US$3,000.00 | Trading |

Lux Liquor is a **customer**, not a supplier, and is not blocked. Huchu Mine is in
**Bulawayo** — never Mutare or Msasa. Account count across the book is **46**.

**Receipt #10238** — one transaction, everywhere: The Gate Shops, Avondale till 2,
04 Sep 2026 at 14:06:05, **US$142.60**, tendered **EcoCash**, Signed by ZIMRA FDMS.
No `RCP-` prefix. It writes four postings: stock relieved, fiscal receipt signed,
journal written, drawer 2 updated.
Other receipts needed: **#10241** is the one the FDMS refused (Card, auth 004501).

**Invoice INV-4471** — The Gate Shops, raised 12 Aug 2026, **US$1,240.00**, Unmatched.

**Journal JNL-88214** — US$4,318.75 across 8 accounts, written by Sell from
receipt #10238, posted by **Rutendo Chiweshe**. Balanced.

**People (Corelith side)** — Tendai Mukamba (cashier, Avondale till 2),
Rutendo Chiweshe (branch manager, Avondale), Blessing Ncube (field technician),
Nyasha Dube (cashier, Borrowdale), Simba Marondera (stock controller, Msasa),
Tapiwa Moyo (buyer). No one holds two roles.

## Corelith Campus

**Terms** — Term 2 2026 ran 05 May – 04 Sep. **Term 3 2026 runs 08 Sep – 04 Dec**;
today is Term 3, **week 1**. Term 2 report cards are being finalised and issued now.
Term 3 fee invoices were raised 08 Sep. Never place today inside Term 2.

**Admission numbers** — one scheme only: `ADM-` plus four digits. The
`ADM-2023-nnnn` scheme does not exist; delete it wherever it appears.

| Learner | Adm. no. | Class | Boarding | Fees |
|---|---|---|---|---|
| Anesu Chikafu | ADM-2419 | Form 3 Blue | Boarder, Chikafu House | Settled |
| Tapiwa Moyo | ADM-2451 | Form 3 Blue | Day learner | Settled |
| Rufaro Chiweshe | ADM-2468 | Form 3 Blue | Day learner | Part-paid |
| Munashe Dube | ADM-2472 | Form 3 Blue | Boarder | In arrears US$550.00 |
| Vimbai Mukamba | ADM-2480 | Form 3 Blue | Day learner | Settled |
| Kudzai Sibanda | ADM-2433 | Grade 6 Green | Day learner | On a payment plan |

Learners are **never** also staff. A learner shown in Grade 4 Blue in one artboard
and Form 3 Blue in another is a bug — use the class in this table.

**Staff** — Chipo Zvobgo (Head, STF-0001), Rutendo Chiweshe (Mathematics, Form 3
Blue class teacher, STF-0089), Blessing Ncube (Grade 4 Blue class teacher,
STF-0104), Tariro Gwenzi (Geography, STF-0117), Simba Marondera (bursar's clerk,
STF-0142). Staff are never learners, and a guardian never teaches their own child's
class. Use **plain names**, not honorifics — "Rutendo Chiweshe", never "Mrs Chiweshe".

**Guardians** — Farai Mutasa, father of **two**: Anesu Chikafu and Tapiwa Moyo.
Nyasha Dube (Campus), mother of Anesu Chikafu only. May-collect is set per guardian.

**School totals** — 166 on roll. **37 in arrears**, **US$15,585.00** outstanding
(ZWG 522,876.75 at 33.5500). Of the 37: 26 reachable by SMS, 7 by email, 4 with no
number on file. Any other split is wrong.

**Fee receipts** are a different fiscal device from the shops: series `FEE-2026-nnnn`,
device `CRL-FDMS-04`. They never reuse a shop receipt number such as #10238.

## Status vocabulary — word to tone, fixed

| Tone | Words |
|---|---|
| `ok` | Posted · Signed · Reconciled · Matched · Filed · Final · Issued |
| `acc` | Queued · In progress · Trading · Prepared · Ready |
| `warn` | Needs approval · Unmatched |
| `crit` | Overdue · Failed |
| `hollow` | Draft · Open · Closed off · Not started |

`Ready` and `Issued` are Campus report-card states and belong to the ledger; they
are listed on the StatusData sheet alongside the rest. No other words exist. A new
state needs a new word here, not a new colour on an old one.
