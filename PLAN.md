# Implementation Plan — Tricura Policy Dashboard

## Status Legend
- ✅ Done
- 🔲 Not started

---

## Phase 1 — Foundation ✅

- ✅ Vite + React + TypeScript scaffold
- ✅ Tailwind CSS v4 + @base-ui/react + shadcn/ui preset installed
- ✅ TanStack Query, React Router, axios, sonner, react-hook-form, zod wired up
- ✅ `src/types/policy.ts` — all types (PolicyListItem, Policy, PendingReview, filter params, etc.)
- ✅ `src/api/client.ts` — axios instance pointing to `http://localhost:4000`
- ✅ `src/api/policies.ts` — listPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy
- ✅ `src/lib/format.ts` — formatMoney, formatDate
- ✅ `src/lib/risk.ts` — computeRisk (0–1 → High/Medium/Low)
- ✅ `src/components/layout/AppShell.tsx` — header + outlet
- ✅ `src/main.tsx` — QueryClient, router, Toaster

---

## Phase 2 — Policy List ✅

- ✅ `src/hooks/model/useFilterModel.ts` — URL-based filter state (read + write)
- ✅ `src/hooks/model/usePoliciesModel.ts` — TanStack Query list query with filter params + placeholderData
- ✅ `src/components/policies/RiskBadge.tsx`
- ✅ `src/components/policies/RiskBar.tsx`
- ✅ `src/components/policies/SeverityBadge.tsx`
- ✅ `src/components/policies/PolicyRow.tsx` — clickable row, expand/collapse
- ✅ `src/components/policies/PolicyTable.tsx` — table with columns + skeleton loading
- ✅ `src/components/policies/Footer/Pagination.tsx` + `Pagination.presenter.ts`
- ✅ `src/pages/Dashboard.tsx` + `Dashboard.presenter.ts` — table area, error/empty state, "+ NEW POLICY"

---

## Phase 3 — Expanded Row & Filters ✅

- ✅ `src/hooks/model/usePolicyModel.ts` — TanStack Query single-policy fetch
- ✅ `src/components/policies/PolicyExpandedRow/PolicyExpandedRow.tsx` + `.presenter.ts` — 3-panel detail
- ✅ `src/components/policies/FilterModal/FilterModal.tsx` + `.presenter.ts` — region, date, range sliders
- ✅ `src/components/policies/FilterBar/FilterBar.tsx` + `.presenter.ts` — search, chips, clear all

---

## Phase 4 — Create & Edit Policy ✅

- ✅ `src/components/ui/field-box.tsx` — FieldBox floating-label input container
- ✅ `src/hooks/model/usePolicyMutations.ts` — create, update, delete mutations with toast + invalidation
- ✅ `src/components/policies/PolicyForm/PolicyForm.tsx` + `.presenter.ts` — react-hook-form + zod, all sections
- ✅ `src/components/policies/PolicyDrawer/PolicyDrawer.tsx` + `.presenter.ts` — centered Dialog, URL-driven (`?new=true` / `?policy=<id>&edit=true`), delete confirmation

---

## Notes

- Multi-region filter is stored in the URL as comma-separated values but the API only accepts a single `region` param; when >1 region is selected the API call omits the filter (client-side limitation, documented in TRD).
- `pendingReviews` array is replaced wholesale on PATCH — always send the full array.
- Do not send `id` on create — the server generates it.
- Create/Edit use URL params (`?new=true`, `?edit=true`) rather than separate routes so filter state is preserved across drawer open/close.
