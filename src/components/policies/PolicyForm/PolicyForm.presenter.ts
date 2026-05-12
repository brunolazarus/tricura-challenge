import { useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { CreatePolicyPayload, Policy, Region, ReviewType, Severity } from '@/types/policy'

// ── Constants ─────────────────────────────────────────────────────────────────

export const REGIONS: Region[] = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
export const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical']
export const REVIEW_TYPES: ReviewType[] = [
  'License',
  'Staff Training',
  'Incident Report',
  'Billing Documentation',
  'Care Plan',
  'Medication Log',
  'Facility Inspection',
  'Insurance Certificate',
]

// ── Schema ────────────────────────────────────────────────────────────────────

const reviewSchema = z.object({
  type: z.enum([
    'License', 'Staff Training', 'Incident Report', 'Billing Documentation',
    'Care Plan', 'Medication Log', 'Facility Inspection', 'Insurance Certificate',
  ] as const),
  dueDate: z.string().min(1, 'Required'),
  severity: z.enum(['low', 'medium', 'high', 'critical'] as const),
})

const formSchema = z.object({
  accountName: z.string().min(1, 'Required'),
  region: z.enum(['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'] as const),
  facilityCount: z.coerce.number().int().min(1, 'At least 1'),
  effectiveDate: z.string().min(1, 'Required'),
  premium: z.coerce.number().min(0),
  claimsTotal: z.coerce.number().min(0),
  reimbursementRisk: z.number().min(0).max(1),
  missingDocuments: z.coerce.number().int().min(0),
  expiredDocuments: z.coerce.number().int().min(0),
  pendingReviews: z.array(reviewSchema),
})

export type PolicyFormValues = z.infer<typeof formSchema>

const DEFAULT_VALUES: PolicyFormValues = {
  accountName: '',
  region: 'Northeast',
  facilityCount: 1,
  effectiveDate: '',
  premium: 0,
  claimsTotal: 0,
  reimbursementRisk: 0,
  missingDocuments: 0,
  expiredDocuments: 0,
  pendingReviews: [],
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function policyToFormValues(policy: Policy): PolicyFormValues {
  return {
    accountName: policy.account.name,
    region: policy.account.region,
    facilityCount: policy.account.facilityCount,
    effectiveDate: policy.renewal.effectiveDate,
    premium: policy.financials.premium,
    claimsTotal: policy.financials.claimsTotal,
    reimbursementRisk: policy.financials.reimbursementRisk,
    missingDocuments: policy.compliance.missingDocuments,
    expiredDocuments: policy.compliance.expiredDocuments,
    pendingReviews: policy.compliance.pendingReviews,
  }
}

function buildPayload(values: PolicyFormValues): CreatePolicyPayload {
  return {
    account: { name: values.accountName, region: values.region, facilityCount: values.facilityCount },
    renewal: {
      effectiveDate: values.effectiveDate,
      daysUntilRenewal: differenceInCalendarDays(parseISO(values.effectiveDate), new Date()),
    },
    compliance: {
      missingDocuments: values.missingDocuments,
      expiredDocuments: values.expiredDocuments,
      pendingReviews: values.pendingReviews,
    },
    financials: {
      premium: values.premium,
      claimsTotal: values.claimsTotal,
      reimbursementRisk: values.reimbursementRisk,
    },
  }
}

// ── Presenter ─────────────────────────────────────────────────────────────────

export interface PolicyFormProps {
  defaultValues?: PolicyFormValues
  onSubmit: (payload: CreatePolicyPayload) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
  isSubmitting: boolean
  submitLabel: string
}

export function usePolicyFormPresenter({
  defaultValues,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting,
  submitLabel,
}: PolicyFormProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } =
    useForm<PolicyFormValues>({
      resolver: zodResolver(formSchema) as Resolver<PolicyFormValues>,
      defaultValues: defaultValues ?? DEFAULT_VALUES,
    })

  const { fields, append, remove } = useFieldArray({ control, name: 'pendingReviews' })

  const effectiveDate = watch('effectiveDate')
  const risk = watch('reimbursementRisk')

  const daysUntilRenewal = effectiveDate
    ? differenceInCalendarDays(parseISO(effectiveDate), new Date())
    : null

  function onRiskInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value)
    if (!isNaN(v)) setValue('reimbursementRisk', Math.min(1, Math.max(0, v)))
  }

  function addReview() {
    append({ type: 'License', dueDate: '', severity: 'low' })
  }

  const handleFormSubmit = handleSubmit((values) => onSubmit(buildPayload(values)))

  return {
    register,
    control,
    errors,
    fields,
    addReview,
    removeReview: remove,
    daysUntilRenewal,
    risk,
    onRiskInputChange,
    handleFormSubmit,
    onCancel,
    onDelete,
    isSubmitting,
    submitLabel,
  }
}
