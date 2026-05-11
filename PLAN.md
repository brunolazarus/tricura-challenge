# Implementation Plan — Tricura Policy Dashboard

## Status Legend
- ✅ Done
- 🔲 Not started

---

## Phase 1 — Foundation ✅

- ✅ Vite + React + TypeScript scaffold
- ✅ Tailwind CSS v4 + shadcn/ui components installed
- ✅ TanStack Query, React Router, axios, sonner, react-hook-form, zod wired up
- ✅ `src/types/policy.ts` — all types (PolicyListItem, Policy, PendingReview, filter params, etc.)
- ✅ `src/api/client.ts` — axios instance pointing to `http://localhost:4000`
- ✅ `src/api/policies.ts` — listPolicies, getPolicy, createPolicy, updatePolicy, deletePolicy
- ✅ `src/lib/format.ts` — formatMoney, formatMoneyFull, formatDate
- ✅ `src/lib/risk.ts` — computeRisk (0–1 → High/Medium/Low)
- ✅ `src/components/layout/AppShell.tsx` — header + outlet
- ✅ `src/main.tsx` — QueryClient, router, Toaster

---

## Phase 2 — Policy List ✅

- ✅ `src/hooks/usePolicies.ts` — TanStack Query wrapper with placeholderData
- ✅ `src/hooks/useFilterParams.ts` — URL-based filter state (read + write)
- ✅ `src/components/policies/RiskBadge.tsx`
- ✅ `src/components/policies/RiskBar.tsx`
- ✅ `src/components/policies/SeverityBadge.tsx`
- ✅ `src/components/policies/PolicyRow.tsx` — clickable row, expand/collapse
- ✅ `src/components/policies/PolicyTable.tsx` — table with columns + skeleton loading
- ✅ `src/components/policies/Pagination.tsx`
- ✅ `src/pages/Dashboard.tsx` — table area, error state, empty state, "+ NEW POLICY" stub

---

## Phase 3 — Expanded Row & Filters ✅

- ✅ `src/hooks/usePolicy.ts` — TanStack Query single-policy fetch
- ✅ `src/components/policies/PolicyExpandedRow.tsx` — 3-panel detail (Renewal/Account, Financials, Compliance with pending reviews + EDIT button)
- ✅ `src/components/policies/FilterModal.tsx` — region, date, premium, claims, risk sliders
- ✅ `src/components/policies/FilterBar.tsx` — search input (debounced), filter chips, clear all

---

## Phase 4 — Create & Edit Policy 🔲

- 🔲 `src/components/policies/PolicyForm.tsx`
  - Shared form for create and edit
  - react-hook-form + zod schema matching `CreatePolicyPayload`
  - Fields: account (name, region, facilityCount), renewal (effectiveDate), compliance (missingDocuments, expiredDocuments, pendingReviews), financials (premium, claimsTotal, reimbursementRisk)
  - PendingReview sub-form with add/remove rows

- 🔲 `src/components/policies/PolicyDrawer.tsx`
  - Sheet/drawer wrapper that reads `?edit=true` + `?policy=<id>` from the URL
  - Create mode: opens when path is `/policies/new` or "+ NEW POLICY" is clicked
  - Edit mode: pre-fills from `usePolicy(id)` cache
  - Submit → createPolicy / updatePolicy → invalidate queries → toast → close

- 🔲 Wire "+ NEW POLICY" button in Dashboard to open drawer (set `?new=true` or navigate to `/policies/new`)

- 🔲 Delete button inside edit drawer
  - Confirmation dialog
  - On confirm: deletePolicy → invalidate ['policies'] → close drawer → toast

---

## Notes

- Multi-region filter is stored in the URL as comma-separated values but the API only accepts a single `region` param; when >1 region is selected the API call omits the filter (client-side limitation, not a bug).
- `pendingReviews` array is replaced wholesale on PATCH — always send the full array.
- Do not send `id` on create — the server generates it.
