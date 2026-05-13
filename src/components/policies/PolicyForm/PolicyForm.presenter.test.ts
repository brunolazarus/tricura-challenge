import { describe, it, expect } from 'vitest'
import { buildPayload, policyToFormValues, type PolicyFormValues } from './PolicyForm.presenter'
import type { Policy } from '@/types/policy'

const baseFormValues: PolicyFormValues = {
  accountName: 'Acme Health',
  region: 'Northeast',
  facilityCount: 3,
  effectiveDate: '2026-07-01',
  premium: 200_000,
  claimsTotal: 50_000,
  reimbursementRisk: 0.45,
  missingDocuments: 2,
  expiredDocuments: 1,
  pendingReviews: [],
}

const basePolicy: Policy = {
  id: 'POL-0001',
  account: { name: 'Acme Health', region: 'Northeast', facilityCount: 3 },
  renewal: { effectiveDate: '2026-07-01', daysUntilRenewal: 50 },
  compliance: { missingDocuments: 2, expiredDocuments: 1, pendingReviews: [] },
  financials: { premium: 200_000, claimsTotal: 50_000, reimbursementRisk: 0.45 },
}

describe('buildPayload', () => {
  it('maps flat form values to the nested API payload shape', () => {
    const payload = buildPayload(baseFormValues)
    expect(payload.account).toEqual({ name: 'Acme Health', region: 'Northeast', facilityCount: 3 })
    expect(payload.renewal).toEqual({ effectiveDate: '2026-07-01', daysUntilRenewal: expect.any(Number) })
    expect(payload.financials).toEqual({ premium: 200_000, claimsTotal: 50_000, reimbursementRisk: 0.45 })
    expect(payload.compliance).toEqual({ missingDocuments: 2, expiredDocuments: 1, pendingReviews: [] })
  })

  it('includes a client-computed daysUntilRenewal (required by POST, stored verbatim by the API)', () => {
    const payload = buildPayload(baseFormValues)
    expect(payload.renewal).toHaveProperty('daysUntilRenewal')
    expect(typeof payload.renewal.daysUntilRenewal).toBe('number')
  })

  it('includes pending reviews in the payload', () => {
    const review = { type: 'License' as const, dueDate: '2026-08-01', severity: 'high' as const }
    const payload = buildPayload({ ...baseFormValues, pendingReviews: [review] })
    expect(payload.compliance.pendingReviews).toEqual([review])
  })
})

describe('policyToFormValues', () => {
  it('maps a nested Policy to flat form values', () => {
    const values = policyToFormValues(basePolicy)
    expect(values.accountName).toBe('Acme Health')
    expect(values.region).toBe('Northeast')
    expect(values.facilityCount).toBe(3)
    expect(values.effectiveDate).toBe('2026-07-01')
    expect(values.premium).toBe(200_000)
    expect(values.claimsTotal).toBe(50_000)
    expect(values.reimbursementRisk).toBe(0.45)
    expect(values.missingDocuments).toBe(2)
    expect(values.expiredDocuments).toBe(1)
    expect(values.pendingReviews).toEqual([])
  })

  it('round-trips through buildPayload without losing data', () => {
    const payload = buildPayload(policyToFormValues(basePolicy))
    expect(payload.account.name).toBe(basePolicy.account.name)
    expect(payload.financials.reimbursementRisk).toBe(basePolicy.financials.reimbursementRisk)
    expect(payload.compliance.pendingReviews).toEqual(basePolicy.compliance.pendingReviews)
  })
})
