# Tricura Policy Dashboard

A React SPA for insurance underwriters to browse, filter, view, create, edit, and delete policies. Built as a take-home challenge.

## Prerequisites

- Node.js 20+
- The backend API running at `http://localhost:4000` (separate repo)

## Getting started

```bash
npm install
npm run dev        # starts Vite dev server (defaults to :5173)
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | TypeScript check + Vite production build |
| `npm run lint` | ESLint |
| `npm run preview` | Serve the production build locally |

## Architecture

The app uses a **three-layer component model**:

```
Model hook          (src/hooks/model/)         — TanStack Query + URL state
Presenter           (Component.presenter.ts)   — derives view-ready data from model
View                (Component.tsx)            — renders, no business logic
```

Every complex component (FilterBar, FilterModal, Pagination, PolicyExpandedRow, PolicyForm, PolicyDrawer, Dashboard) has a sibling `.presenter.ts` that owns all derivation logic. Views only call hooks and render JSX.

## Project structure

```
src/
├── api/                         # axios client + policy CRUD functions
├── components/
│   ├── boundary/                # EmptyState, ErrorState
│   ├── layout/                  # AppShell (header + outlet)
│   ├── policies/
│   │   ├── FilterBar/           # search input + chips + active count
│   │   ├── FilterModal/         # region/date/range filter dialog
│   │   ├── Footer/              # Pagination
│   │   ├── PolicyDrawer/        # create + edit dialog (URL-driven)
│   │   ├── PolicyExpandedRow/   # 3-panel inline detail
│   │   ├── PolicyForm/          # react-hook-form + zod form
│   │   ├── PolicyRow.tsx        # table row (clickable, expand/collapse)
│   │   ├── PolicyTable.tsx      # table + skeleton
│   │   ├── RiskBadge.tsx
│   │   ├── RiskBar.tsx
│   │   └── SeverityBadge.tsx
│   └── ui/                      # shadcn/ui + @base-ui/react primitives
├── hooks/
│   └── model/
│       ├── useFilterModel.ts    # URL param read/write for all filter state
│       ├── usePoliciesModel.ts  # list query with filter params
│       ├── usePolicyModel.ts    # single policy query
│       └── usePolicyMutations.ts# create / update / delete mutations
├── lib/
│   ├── format.ts                # formatMoney, formatDate
│   ├── risk.ts                  # reimbursementRisk → High/Medium/Low
│   └── utils.ts                 # cn (tailwind-merge + clsx)
├── pages/
│   ├── Dashboard.tsx
│   └── Dashboard.presenter.ts
└── types/
    └── policy.ts                # PolicyListItem, Policy, PendingReview, etc.
```

## Known limitations & deliberate decisions

- **Status filter omitted**: the assessment spec references a status filter, but neither the `GET /policies` list endpoint nor the `GET /policies/:id` detail shape exposes a `status` field. Rather than implement a UI control with no backend support, the filter was omitted. If a status field is added to the API, the filter can be wired up through the existing `useFilterModel` / `FilterModal` pipeline without structural changes.
- **`daysUntilRenewal` is server-owned**: the API returns this field on `GET /policies/:id` but clients never send it — it is computed by the server from `effectiveDate`. `CreatePolicyPayload` and `UpdatePolicyPayload` intentionally omit it.
- **Multi-region filter**: the API only accepts a single `region` param. When more than one region is selected the API call omits the filter entirely; all matching regions are shown client-side via chips but not enforced server-side.
- **No authentication**: the API is assumed to be open on localhost.
- **No tests**: unit/integration tests are out of scope for this challenge.
- **Dark mode**: `next-themes` is installed but dark mode is not wired up.
