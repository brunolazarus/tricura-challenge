# Tricura Policy Dashboard

## TL;DR

React + TypeScript SPA for insurance underwriters to browse, filter, and manage policies against a REST API at `localhost:4000`.

```bash
npm install && npm run dev   # requires the API server running at :4000
```

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · TanStack Query v5 · React Router v7 · react-hook-form + zod · axios · sonner

**Key calls made:** URL-first state (all filters survive reload), presenter pattern (views contain zero logic), `daysUntilRenewal` treated as server-owned, status filter omitted (no API field), multi-region UI degrades gracefully when API limitation is hit.

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

### `daysUntilRenewal` — server-owned, never sent by the client

`GET /policies/:id` returns `renewal.daysUntilRenewal` as a computed integer. `CreatePolicyPayload` and `UpdatePolicyPayload` intentionally exclude it — clients only send `effectiveDate` and let the server derive the days value. Sending a client-computed snapshot would produce stale data on every subsequent read.

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
