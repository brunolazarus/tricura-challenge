# Technical Requirements Document — Tricura Policy Dashboard

## Overview

A React SPA for insurance underwriters to browse, filter, view, create, edit, and delete policies via a REST backend (`http://localhost:4000`).

## Stack

| Concern | Choice |
|---|---|
| Framework | React 19 + Vite + TypeScript |
| Styling | Tailwind CSS v4 |
| UI primitives | @base-ui/react (headless) + shadcn/ui preset |
| Data fetching | TanStack Query v5 |
| Routing | React Router v7 |
| Forms | react-hook-form + zod |
| HTTP | axios |
| Notifications | sonner |
| Date formatting | date-fns |

## Architecture

The app uses a **three-layer component model**:

| Layer | Location | Responsibility |
|---|---|---|
| Model hook | `src/hooks/model/` | TanStack Query + URL-param state read/write |
| Presenter | `ComponentName.presenter.ts` | Derives view-ready data; owns all logic |
| View | `ComponentName.tsx` | Calls presenter hook, renders JSX only |

Complex components (FilterBar, FilterModal, Pagination, PolicyExpandedRow, PolicyForm, PolicyDrawer, Dashboard) each live in their own folder alongside a `.presenter.ts` sibling.

## Pages & Routes

| Path | Component | Notes |
|---|---|---|
| `/policies` | `Dashboard` | Policy list + filters |
| `*` | redirect → `/policies` | |

> Create and Edit are **not separate routes**. They are triggered by URL query params (`?new=true`, `?edit=true`) on `/policies`, keeping all filter state intact when the drawer opens and closes.

## Feature Requirements

### 1. Policy List Table

- Columns: Account Name + ID, Region, Facilities, Effective Date, Premium, Claims Total, Risk
- Skeleton loading (same row count as current page limit)
- Click row → inline expanded detail panel; click again → collapse
- Pagination below table

### 2. Expanded Row Detail (3 panels)

- **Renewal & Account**: effective date, days to renewal (color-coded by urgency), region, facility count
- **Financials**: premium, claims total, reimbursement risk bar
- **Compliance**: missing/expired doc counts, pending reviews list with severity badges, EDIT button

### 3. Filter Bar

- Debounced text search (300 ms) → `?search=`
- FILTERS button → opens FilterModal; shows active count badge
- Active filter chips with individual × dismiss
- CLEAR ALL button when any filter is active

### 4. Filter Modal

- Region: multi-select checkboxes (Northeast, Southeast, Midwest, Southwest, West)
- Effective Date: from/to date inputs
- Premium: range slider + number inputs ($0 – $1M, step $10k)
- Claims Total: range slider + number inputs ($0 – $1M, step $10k)
- Reimbursement Risk: range slider + number inputs (0.00 – 1.00, step 0.01)
- RESET ALL, CANCEL, APPLY FILTERS actions
- All state is URL-based (`?regions=`, `?dateFrom=`, `?riskMin=`, etc.)

> **API limitation**: `region` param accepts only a single value. When >1 region is selected the API call omits the filter; the chips still display and can be dismissed individually.

### 5. Create Policy

- Triggered by "+ NEW POLICY" button → sets `?new=true` in URL
- Centered Dialog with `react-hook-form` + zod schema validation
- Fields mirror `CreatePolicyPayload` (no `id` — server generates it)
- On success: invalidate `['policies']` query, show success toast, close dialog

### 6. Edit Policy

- Triggered by EDIT button in the compliance panel → sets `?edit=true` alongside `?policy=<id>`
- Same form as create, pre-filled from cached `['policy', id]` data
- Submits via `PATCH /policies/:id` (arrays replaced wholesale — send full arrays)
- On success: invalidate `['policy', id]` and `['policies']`, show success toast

### 7. Delete Policy

- Triggered from the edit form (delete button)
- Confirmation dialog before sending `DELETE /policies/:id`
- On success: invalidate `['policies']`, close dialog, show toast

## Data Model

### `PolicyListItem` (GET /policies — flat)
```ts
{ id, accountName, region, facilityCount, effectiveDate, premium, claimsTotal, reimbursementRisk }
```

### `Policy` (GET /policies/:id — nested)
```ts
{
  id,
  account: { name, region, facilityCount },
  renewal: { effectiveDate, daysUntilRenewal },
  compliance: { missingDocuments, expiredDocuments, pendingReviews: PendingReview[] },
  financials: { premium, claimsTotal, reimbursementRisk }
}
```

### `PendingReview`
```ts
{ type: ReviewType, dueDate: string, severity: 'low' | 'medium' | 'high' | 'critical' }
```

## Risk Classification

| `reimbursementRisk` | Level |
|---|---|
| ≥ 0.70 | High (red) |
| 0.40 – 0.69 | Medium (yellow) |
| < 0.40 | Low (green) |

## URL State Contract

| Param | Type | Description |
|---|---|---|
| `page` | number | Current page (default 1) |
| `limit` | number | Page size (default 20) |
| `search` | string | Account name search |
| `regions` | CSV string | Selected regions |
| `dateFrom` | ISO date | Effective date lower bound |
| `dateTo` | ISO date | Effective date upper bound |
| `riskMin` | number | Reimbursement risk lower bound |
| `riskMax` | number | Reimbursement risk upper bound |
| `premiumMin` | number | Premium lower bound |
| `premiumMax` | number | Premium upper bound |
| `claimsMin` | number | Claims total lower bound |
| `claimsMax` | number | Claims total upper bound |
| `policy` | string | Expanded/active policy ID |
| `edit` | `"true"` | Edit drawer open (requires `policy`) |
| `new` | `"true"` | Create drawer open |

## MVP Scope & Known Limitations

| Item | Status |
|---|---|
| Multi-region API filter | Out of scope — API accepts one `region`; multi-select is UI-only |
| Authentication | Out of scope — API is open on localhost |
| Unit / integration tests | Out of scope for challenge |
| Dark mode | Dependency installed (`next-themes`), not wired up |
| Sorting | Not implemented — API does not expose a sort param |
