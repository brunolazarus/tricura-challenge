import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { differenceInCalendarDays, parseISO } from 'date-fns'
import { PlusIcon, Trash2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CreatePolicyPayload, Policy, Region, ReviewType, Severity } from '@/types/policy'

const REGIONS: Region[] = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical']
const REVIEW_TYPES: ReviewType[] = [
  'License',
  'Staff Training',
  'Incident Report',
  'Billing Documentation',
  'Care Plan',
  'Medication Log',
  'Facility Inspection',
  'Insurance Certificate',
]

const reviewSchema = z.object({
  type: z.enum([
    'License',
    'Staff Training',
    'Incident Report',
    'Billing Documentation',
    'Care Plan',
    'Medication Log',
    'Facility Inspection',
    'Insurance Certificate',
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

interface Props {
  defaultValues?: PolicyFormValues
  onSubmit: (payload: CreatePolicyPayload) => Promise<void>
  onCancel: () => void
  onDelete?: () => void
  isSubmitting: boolean
}

export function PolicyForm({ defaultValues, onSubmit, onCancel, onDelete, isSubmitting }: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues ?? DEFAULT_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'pendingReviews' })
  const risk = watch('reimbursementRisk')

  function buildPayload(values: PolicyFormValues): CreatePolicyPayload {
    return {
      account: {
        name: values.accountName,
        region: values.region,
        facilityCount: values.facilityCount,
      },
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

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(buildPayload(values)))}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Account */}
        <Section label="Account">
          <Field label="Account Name" error={errors.accountName?.message}>
            <Input {...register('accountName')} placeholder="Acme Healthcare" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Region" error={errors.region?.message}>
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field label="Facility Count" error={errors.facilityCount?.message}>
              <Input type="number" min={1} {...register('facilityCount')} />
            </Field>
          </div>
        </Section>

        <Separator />

        {/* Renewal */}
        <Section label="Renewal">
          <Field label="Effective Date" error={errors.effectiveDate?.message}>
            <Input type="date" {...register('effectiveDate')} />
          </Field>
        </Section>

        <Separator />

        {/* Financials */}
        <Section label="Financials">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Premium ($)" error={errors.premium?.message}>
              <Input type="number" min={0} step={1000} {...register('premium')} />
            </Field>
            <Field label="Claims Total ($)" error={errors.claimsTotal?.message}>
              <Input type="number" min={0} step={1000} {...register('claimsTotal')} />
            </Field>
          </div>
          <Field
            label={`Reimbursement Risk — ${risk.toFixed(2)}`}
            error={errors.reimbursementRisk?.message}
          >
            <Controller
              control={control}
              name="reimbursementRisk"
              render={({ field }) => (
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[field.value]}
                  onValueChange={([v]) => field.onChange(v)}
                />
              )}
            />
          </Field>
        </Section>

        <Separator />

        {/* Compliance */}
        <Section label="Compliance">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Missing Documents" error={errors.missingDocuments?.message}>
              <Input type="number" min={0} {...register('missingDocuments')} />
            </Field>
            <Field label="Expired Documents" error={errors.expiredDocuments?.message}>
              <Input type="number" min={0} {...register('expiredDocuments')} />
            </Field>
          </div>
        </Section>

        <Separator />

        {/* Pending Reviews */}
        <Section label="Pending Reviews">
          <div className="space-y-3">
            {fields.map((field, i) => (
              <div key={field.id} className="rounded-lg border border-border p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Review {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="Remove review"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type" error={errors.pendingReviews?.[i]?.type?.message}>
                    <Controller
                      control={control}
                      name={`pendingReviews.${i}.type`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REVIEW_TYPES.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <Field label="Severity" error={errors.pendingReviews?.[i]?.severity?.message}>
                    <Controller
                      control={control}
                      name={`pendingReviews.${i}.severity`}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SEVERITIES.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                </div>
                <Field label="Due Date" error={errors.pendingReviews?.[i]?.dueDate?.message}>
                  <Input type="date" {...register(`pendingReviews.${i}.dueDate`)} />
                </Field>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 text-xs"
            onClick={() => append({ type: 'License', dueDate: '', severity: 'low' })}
          >
            <PlusIcon className="h-3.5 w-3.5 mr-1.5" />
            Add Review
          </Button>
        </Section>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
        {onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive text-xs font-semibold tracking-wide"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            DELETE
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs font-semibold tracking-wide"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            CANCEL
          </Button>
          <Button
            type="submit"
            size="sm"
            className="text-xs font-semibold tracking-wide"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'SAVING…' : 'SAVE'}
          </Button>
        </div>
      </div>
    </form>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
