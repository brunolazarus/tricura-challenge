import { Controller } from "react-hook-form";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { FieldBox, fieldBoxInputCls } from "@/components/ui/field-box";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  usePolicyFormPresenter,
  REGIONS,
  SEVERITIES,
  REVIEW_TYPES,
  type PolicyFormProps,
} from "./PolicyForm.presenter";

export function PolicyForm(props: PolicyFormProps) {
  const {
    register,
    control,
    errors,
    fields,
    addReview,
    removeReview,
    daysUntilRenewal,
    risk,
    onRiskInputChange,
    handleFormSubmit,
    onCancel,
    onDelete,
    isSubmitting,
    submitLabel,
  } = usePolicyFormPresenter(props);

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col flex-1 overflow-hidden"
    >
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* ACCOUNT */}
        <Section label="Account">
          <FieldBox label="Account name" error={errors.accountName?.message}>
            <input
              {...register("accountName")}
              placeholder="Acme Healthcare"
              className={fieldBoxInputCls}
            />
          </FieldBox>
          <div className="grid grid-cols-2 gap-3">
            <FieldBox label="Region" error={errors.region?.message}>
              <Controller
                control={control}
                name="region"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="border-0 h-auto p-0 w-full rounded-none focus-visible:ring-0 text-sm">
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
            </FieldBox>
            <FieldBox
              label="Facility count"
              error={errors.facilityCount?.message}
            >
              <input
                type="number"
                min={1}
                {...register("facilityCount")}
                className={fieldBoxInputCls}
              />
            </FieldBox>
          </div>
        </Section>

        <Separator />

        {/* RENEWAL */}
        <Section label="Renewal">
          <div className="grid grid-cols-2 gap-3">
            <FieldBox
              label="Effective date"
              error={errors.effectiveDate?.message}
            >
              <input
                type="date"
                {...register("effectiveDate")}
                className={fieldBoxInputCls}
              />
            </FieldBox>
            <FieldBox label="Days until renewal (computed)">
              <p className="text-sm text-foreground py-px">
                {daysUntilRenewal !== null ? daysUntilRenewal : "—"}
              </p>
            </FieldBox>
          </div>
        </Section>

        <Separator />

        {/* FINANCIALS */}
        <Section label="Financials">
          <div className="grid grid-cols-2 gap-3">
            <FieldBox label="Premium ($)" error={errors.premium?.message}>
              <input
                type="number"
                min={0}
                step={1000}
                {...register("premium")}
                className={fieldBoxInputCls}
              />
            </FieldBox>
            <FieldBox
              label="Claims total ($)"
              error={errors.claimsTotal?.message}
            >
              <input
                type="number"
                min={0}
                step={1000}
                {...register("claimsTotal")}
                className={fieldBoxInputCls}
              />
            </FieldBox>
          </div>
        </Section>

        <Separator />

        {/* REIMBURSEMENT RISK */}
        <Section label="Reimbursement Risk">
          <FieldBox label="Value" error={errors.reimbursementRisk?.message}>
            <input
              type="number"
              min={0}
              max={1}
              step={0.01}
              value={risk}
              onChange={onRiskInputChange}
              className={fieldBoxInputCls}
            />
          </FieldBox>
          <Controller
            control={control}
            name="reimbursementRisk"
            render={({ field }) => (
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={[field.value]}
                onValueChange={(v) => field.onChange(v)}
              />
            )}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.00</span>
            <span>1.00</span>
          </div>
        </Section>

        <Separator />

        {/* COMPLIANCE */}
        <Section label="Compliance">
          <div className="grid grid-cols-2 gap-3">
            <FieldBox
              label="Missing documents"
              error={errors.missingDocuments?.message}
            >
              <input
                type="number"
                min={0}
                {...register("missingDocuments")}
                className={fieldBoxInputCls}
              />
            </FieldBox>
            <FieldBox
              label="Expired documents"
              error={errors.expiredDocuments?.message}
            >
              <input
                type="number"
                min={0}
                {...register("expiredDocuments")}
                className={fieldBoxInputCls}
              />
            </FieldBox>
          </div>
        </Section>

        <Separator />

        {/* PENDING REVIEWS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Pending Reviews
            </p>
            <button
              type="button"
              onClick={addReview}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              ADD REVIEW
            </button>
          </div>

          {fields.map((field, i) => (
            <div
              key={field.id}
              className="grid grid-cols-2 sm:grid-cols-[1fr_150px_120px_auto] gap-2 items-end"
            >
              <FieldBox
                label="Type"
                error={errors.pendingReviews?.[i]?.type?.message}
              >
                <Controller
                  control={control}
                  name={`pendingReviews.${i}.type`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-0 h-auto p-0 w-full rounded-none focus-visible:ring-0 text-sm">
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
              </FieldBox>
              <FieldBox
                label="Due date"
                error={errors.pendingReviews?.[i]?.dueDate?.message}
              >
                <input
                  type="date"
                  {...register(`pendingReviews.${i}.dueDate`)}
                  className={fieldBoxInputCls}
                />
              </FieldBox>
              <FieldBox
                label="Severity"
                error={errors.pendingReviews?.[i]?.severity?.message}
              >
                <Controller
                  control={control}
                  name={`pendingReviews.${i}.severity`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="border-0 h-auto p-0 w-full rounded-none focus-visible:ring-0 text-sm">
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
              </FieldBox>
              <button
                type="button"
                onClick={() => removeReview(i)}
                className="mb-2 text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Remove review"
              >
                <Trash2Icon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
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
            {isSubmitting ? "SAVING…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}
