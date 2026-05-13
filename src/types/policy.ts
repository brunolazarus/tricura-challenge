export type Region = 'Northeast' | 'Southeast' | 'Midwest' | 'Southwest' | 'West'

export type ReviewType =
  | 'License'
  | 'Staff Training'
  | 'Incident Report'
  | 'Billing Documentation'
  | 'Care Plan'
  | 'Medication Log'
  | 'Facility Inspection'
  | 'Insurance Certificate'

export type Severity = 'low' | 'medium' | 'high' | 'critical'

export type RiskLevel = 'High' | 'Medium' | 'Low'

export interface PendingReview {
  type: ReviewType
  dueDate: string
  severity: Severity
}

// Flat shape returned by GET /policies list
export interface PolicyListItem {
  id: string
  accountName: string
  region: Region
  facilityCount: number
  effectiveDate: string
  premium: number
  claimsTotal: number
  reimbursementRisk: number
}

// Nested shape returned by GET /policies/:id, POST, PATCH
export interface Policy {
  id: string
  account: {
    name: string
    region: Region
    facilityCount: number
  }
  renewal: {
    effectiveDate: string
    daysUntilRenewal: number
  }
  compliance: {
    missingDocuments: number
    expiredDocuments: number
    pendingReviews: PendingReview[]
  }
  financials: {
    premium: number
    claimsTotal: number
    reimbursementRisk: number
  }
}

// daysUntilRenewal is server-computed from effectiveDate — never sent by the client
export interface CreatePolicyPayload {
  account: Policy['account']
  renewal: Pick<Policy['renewal'], 'effectiveDate'>
  compliance: Policy['compliance']
  financials: Policy['financials']
}

export type UpdatePolicyPayload = Partial<CreatePolicyPayload>

export interface PolicyListParams {
  page?: number
  limit?: number
  region?: Region
  search?: string
  effectiveDateFrom?: string
  effectiveDateTo?: string
  reimbursementRiskMin?: number
  reimbursementRiskMax?: number
  premiumMin?: number
  premiumMax?: number
  claimsTotalMin?: number
  claimsTotalMax?: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PolicyListResponse {
  data: PolicyListItem[]
  pagination: Pagination
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
