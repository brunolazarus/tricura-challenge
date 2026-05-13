# Tricura Policy Dashboard

## TL;DR

React + TypeScript SPA for insurance underwriters to browse, filter, and manage policies against a REST API at `localhost:4000`.

```bash
npm install && npm run dev   # requires the API server running at :4000
```

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · TanStack Query v5 · React Router v7 · react-hook-form + zod · axios · sonner

**Key calls made:** URL-first state (all filters survive reload), presenter pattern (views contain zero logic), `daysUntilRenewal` client-computed and sent on every save, status filter omitted (no API field), multi-region UI degrades gracefully when API limitation is hit.

---

## What it does

| Feature | Details |
|---|---|
| Policy list | Paginated table with skeleton loading; click a row to expand a 3-panel detail view |
| Filtering | Debounced search + filter modal (region, date range, premium, claims, risk); all state lives in the URL |
| Filter chips | One chip per active filter group; each dismissable individually or all at once |
| Create policy | Dialog form with full validation; triggered by `?new=true` |
| Edit policy | Pre-filled form from cached data; triggered by `?policy=<id>&edit=true` |
| Delete policy | Confirmation dialog before `DELETE /policies/:id` |
| Responsive | Full-width card on mobile, centered paper layout from `sm` breakpoint up |

---

## Getting started

**Prerequisites**

- Node.js 20+
- The backend API running at `http://localhost:4000` (separate repo / provided mock server)

```bash
npm install
npm run dev          # Vite dev server at :5173
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest single run (CI) |

---

## Architecture

The app follows a strict **three-layer component model**:

```
Model hook          src/hooks/model/           TanStack Query + URL param read/write
Presenter           Component.presenter.ts     Derives view-ready data, owns all logic
View                Component.tsx              Calls presenter hook, renders JSX only
```

Every non-trivial component ships with a `.presenter.ts` sibling. The view never computes, formats, or filters anything directly — it only calls the presenter and renders what it receives. This makes each layer independently testable and keeps views scannable at a glance.

**URL as the single source of truth**

All filter state, pagination, expanded row, and drawer mode are stored in URL search params. Filters survive page reload, can be bookmarked, and are shareable. Opening or closing the create/edit drawer doesn't wipe the active filters.

**Query invalidation over optimistic updates**

Mutations invalidate relevant TanStack Query keys on success and let the server be the authority on data shape. For a local mock API responding in <5ms the UX is indistinguishable from optimistic updates, and the code is meaningfully simpler — no rollback logic, no temporary IDs for creates.

---

## File structure

```
src/
├── api/
│   ├── client.ts                    # axios instance → http://localhost:4000
│   └── policies.ts                  # listPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy
│
├── components/
│   ├── boundary/
│   │   ├── EmptyState.tsx           # shown when filters return no results
│   │   └── ErrorState.tsx           # shown when a query throws
│   ├── layout/
│   │   └── AppShell.tsx             # top nav + <Outlet />
│   ├── policies/
│   │   ├── FilterBar/               # search input, active chips, CLEAR ALL
│   │   ├── FilterModal/             # region checkboxes, date + range sliders
│   │   ├── Footer/                  # Pagination (page numbers + rows-per-page)
│   │   ├── PolicyDrawer/            # create / edit dialog, delete confirmation
│   │   ├── PolicyExpandedRow/       # inline 3-panel detail (Renewal · Financials · Compliance)
│   │   ├── PolicyForm/              # react-hook-form + zod, shared by create and edit
│   │   ├── PolicyRow.tsx            # clickable table row, expand/collapse
│   │   ├── PolicyTable.tsx          # table columns + skeleton loading state
│   │   ├── RiskBadge.tsx            # High / Medium / Low pill with color
│   │   ├── RiskBar.tsx              # visual risk bar in the expanded panel
│   │   └── SeverityBadge.tsx        # low / medium / high / critical badge
│   └── ui/                          # shadcn/ui primitives (@base-ui/react)
│
├── hooks/
│   └── model/
│       ├── useFilterModel.ts        # URL param read/write for all filter state
│       ├── usePoliciesModel.ts      # paginated list query
│       ├── usePolicyModel.ts        # single policy query (suspense)
│       └── usePolicyMutations.ts    # create / update / delete mutations + toasts
│
├── lib/
│   ├── format.ts                    # formatMoney, formatDate
│   ├── risk.ts                      # reimbursementRisk number → High/Medium/Low
│   └── utils.ts                     # cn (tailwind-merge + clsx)
│
├── pages/
│   ├── Dashboard.tsx                # page shell, Suspense + ErrorBoundary wiring
│   └── Dashboard.presenter.ts
│
└── types/
    └── policy.ts                    # PolicyListItem, Policy, PendingReview, payload types
```

Each folder under `policies/` and any complex component follows the same convention:

```
ComponentName/
├── ComponentName.tsx           # view only
└── ComponentName.presenter.ts  # all logic
```

---

## Key decisions & MVP scope

### Status filter — omitted deliberately

The assessment spec mentions filtering by status. The API exposes no `status` field on any endpoint — not on `GET /policies`, not on `GET /policies/:id`. Rather than build a UI control with no backend support, the filter was omitted. If the field is added to the API it slots directly into `useFilterModel` and `FilterModal` with no structural changes needed.

### `daysUntilRenewal` — client-computed, sent on every save

Confirmed via the live OpenAPI spec and a test POST: `daysUntilRenewal` is **required** in the `POST /policies` request body and the server stores it verbatim — it does not derive it from `effectiveDate`. The client computes it with `date-fns` before every create or update so the stored value stays accurate. The PATCH schema marks it optional, but sending a freshly computed value on edits avoids the stored number going stale if the policy is saved again after the effective date passes.

### Multi-region filter — UI-only, degrades gracefully

The API's `region` param accepts a single value. Selecting multiple regions stores them in the URL as a CSV (`?regions=Northeast,Midwest`) and shows a chip for the whole group, but the API call omits the filter when more than one region is selected. The result set is broader than the user's intent in that edge case, which is preferable to silently dropping chips or erroring.

### Route design — query params over separate routes

Create and Edit are opened via `?new=true` and `?policy=<id>&edit=true` on the single `/policies` route rather than via `/policies/new` or `/policies/:id/edit`. This keeps the active filter + pagination state intact when a user opens and closes the drawer, which matters when they've applied several filters to find the policy they want to edit.

### Out of scope

| Item | Reason |
|---|---|
| Authentication | API is open on localhost for the assessment |
| Dark mode | `next-themes` installed, not wired — out of scope |
| Sorting | No sort param on the API |
| Optimistic updates | <5ms local mock makes them imperceptible; not worth the rollback complexity |

---

## Future improvements

### Policy status & lifecycle
Policies have no `status` field — the assessment spec mentioned one but the API doesn't expose it. Adding `status: 'active' | 'pending' | 'expired' | 'cancelled'` to the API response unlocks a status badge on each table row, a status filter chip in the filter modal (slots into `useFilterModel` and `FilterModal` with no structural changes), and meaningful portfolio-level metrics. This is the highest-value single addition.

### Portfolio analytics
A `/analytics` route with a KPI bar (total policies, total premium in the filtered set, average risk, policies expiring ≤30 days) and charts — risk distribution histogram, premium vs claims scatter to surface outliers, region breakdown. The KPI bar can be computed from the existing list response client-side; the charts benefit from a `GET /policies?limit=1000` or a dedicated `GET /analytics` summary endpoint so the numbers reflect the full dataset rather than the current page.

### Renewal urgency in the table
`daysUntilRenewal` is already color-coded in the expanded detail panel. The list response has `effectiveDate` — computing urgency client-side and surfacing it as a row-level highlight (amber border, "Expiring soon" label) in `PolicyRow` requires no API changes and gives underwriters an at-a-glance view of the workload without opening every row.

### Column sorting
The table has no sort controls. Client-side sort within the current page is a free addition but misleading when paginated — a policy with the highest risk on page 3 would never surface. The full solution is `GET /policies?sortBy=reimbursementRisk&sortOrder=desc` on the API side, with a sort indicator on column headers and `sortBy`/`sortOrder` added to the URL state contract alongside the existing filter params.

### Saved filter presets
Let users name and save a combination of active filters ("High-risk Northeast Q3"). Stored in `localStorage` as serialized URL param strings for a frontend-only implementation. A proper multi-user version requires `GET /views` / `POST /views` / `DELETE /views/:id` on the API so presets persist across devices and can be shared with a team.

### Compliance document uploads
The pending review model has `type`, `dueDate`, and `severity` but no attachment. A `POST /policies/:id/documents` multipart endpoint would close the compliance loop — right now you can track that a document is missing but you can't actually submit it. On the frontend, each pending review row in the form would get a file input and a preview of any attached document.

### Audit log
A `GET /policies/:id/history` endpoint returning a timestamped list of field-level changes (who changed `reimbursementRisk` from 0.4 to 0.8 and when). On the frontend this maps naturally to a fourth panel in the expanded row alongside Renewal, Financials, and Compliance — the panel layout in `PolicyExpandedRow` is already a CSS grid that can accommodate it.

### Bulk operations
Row-level checkboxes and a floating action bar ("Export 4 selected", "Update status for 4 selected"). Requires a `PATCH /policies` endpoint accepting `{ ids: string[], patch: Partial<Policy> }` for bulk updates. The export path (CSV download) is frontend-only — serialize the selected items from the TanStack Query cache to a `Blob` with no new endpoint needed.

### Facility drill-down
`facilityCount` is currently an integer. A `/facilities` resource where each facility has its own compliance records, risk score, and address would let underwriters expand a policy and then drill into individual sites. The expanded row already has a panel structure — a facility list inside the Renewal & Account panel is the natural entry point.
