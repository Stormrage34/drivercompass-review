"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  autosaveVacancyAction,
  saveVacancyAction,
  type EmployerActionState,
} from "@/app/employer/actions";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox, FieldError, HelpText, Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  ACCOMMODATION_OPTIONS,
  APPLICATION_METHODS,
  CONTRACT_TYPES,
  COUNTRIES,
  LOADING_OPTIONS,
  PAY_PERIODS,
  TRANSPORT_CATEGORIES,
} from "@/lib/constants";
import {
  KEY_FIELDS,
  checkPublishable,
  computeInfoScore,
  keyFieldLabel,
  missingKeyFields,
} from "@/lib/vacancy";
import type { Vacancy } from "@/db/schema";

const STEPS = [
  { id: "basics", label: "Job basics" },
  { id: "pay", label: "Pay and employment" },
  { id: "rest", label: "Working arrangements and rest" },
  { id: "duties", label: "Duties, vehicle and routes" },
  { id: "apply", label: "Application and contact" },
] as const;

const REVIEW_STEP = STEPS.length;

function splitListClient(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function stringValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

function draftFromForm(form: HTMLFormElement): Partial<Vacancy> {
  const data = new FormData(form);
  return {
    title: stringValue(data.get("title")),
    country: stringValue(data.get("country")),
    contractingEntity: stringValue(data.get("contractingEntity")),
    transportCategory: stringValue(data.get("transportCategory")) as Vacancy["transportCategory"],
    licenceRequirements: splitListClient(stringValue(data.get("licenceRequirements"))),
    contractType: stringValue(data.get("contractType")) as Vacancy["contractType"],
    grossPayMin: numberOrNull(data.get("grossPayMin")),
    grossPayMax: numberOrNull(data.get("grossPayMax")),
    payStructure: stringValue(data.get("payStructure")),
    workingPattern: stringValue(data.get("workingPattern")),
    rotation: stringValue(data.get("rotation")),
    homeTime: stringValue(data.get("homeTime")),
    loadingUnloading: stringValue(data.get("loadingUnloading")) as Vacancy["loadingUnloading"],
    accommodation: stringValue(data.get("accommodation")) as Vacancy["accommodation"],
    weeklyRest: stringValue(data.get("weeklyRest")),
    vehicleType: stringValue(data.get("vehicleType")),
    operatingCountries: splitListClient(stringValue(data.get("operatingCountries"))),
    languagesRequired: splitListClient(stringValue(data.get("languagesRequired"))),
    applicationMethod: stringValue(data.get("applicationMethod")) as Vacancy["applicationMethod"],
    applicationUrl: stringValue(data.get("applicationUrl")),
    applicationEmail: stringValue(data.get("applicationEmail")),
  };
}

export function VacancyForm({
  vacancy,
  initialUpdatedAt,
  defaultContractingEntity,
  defaultCountry,
  companyVerificationLabel,
  companyVerified,
}: {
  vacancy?: Vacancy;
  initialUpdatedAt?: string;
  defaultContractingEntity: string;
  defaultCountry: string;
  companyVerificationLabel: string;
  companyVerified: boolean;
}) {
  const [state, formAction, pending] = useActionState<EmployerActionState, FormData>(saveVacancyAction, null);
  const [method, setMethod] = useState(vacancy?.applicationMethod ?? "platform_message");
  const [publish, setPublish] = useState(
    vacancy ? ["confirmed", "published_verified", "published_unverified"].includes(vacancy.status) : false,
  );

  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const [reviewDraft, setReviewDraft] = useState<Partial<Vacancy>>({});
  const [draftId, setDraftId] = useState(vacancy?.id ?? "");
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(initialUpdatedAt ?? "");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error" | "conflict">("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const manualSaveRef = useRef(false);
  const draftRef = useRef(draftId);
  const updatedRef = useRef(expectedUpdatedAt);
  const conflictRef = useRef(false);

  const isDraft = !vacancy || vacancy.status === "draft";
  const autosaveEnabled = isDraft;

  useEffect(() => {
    draftRef.current = draftId;
    updatedRef.current = expectedUpdatedAt;
  }, [draftId, expectedUpdatedAt]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  async function runAutosave() {
    const form = formRef.current;
    if (!form || !autosaveEnabled || conflictRef.current || inFlightRef.current || manualSaveRef.current) {
      return;
    }
    const titleField = form.elements.namedItem("title") as HTMLInputElement | null;
    if (!titleField || titleField.value.trim().length < 3) return;

    const data = new FormData(form);
    data.set("vacancyId", draftRef.current);
    data.set("expectedUpdatedAt", updatedRef.current);

    inFlightRef.current = true;
    setSaveState("saving");
    try {
      const result = await autosaveVacancyAction(data);
      if (result.ok) {
        setDraftId(result.id);
        setExpectedUpdatedAt(result.updatedAt);
        draftRef.current = result.id;
        updatedRef.current = result.updatedAt;
        setSaveState("saved");
        setSaveMessage("Draft saved automatically");
        setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else if (result.conflict) {
        conflictRef.current = true;
        setSaveState("conflict");
        setSaveMessage("This draft changed in another tab. Reload before saving.");
      } else {
        setSaveState("error");
        setSaveMessage(result.error);
      }
    } catch {
      setSaveState("error");
      setSaveMessage("Could not reach the server. Your changes are still in this form.");
    } finally {
      inFlightRef.current = false;
    }
  }

  function queueAutosave() {
    if (!autosaveEnabled || conflictRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void runAutosave();
    }, 1800);
  }

  function fieldsForStep(index: number): HTMLElement[] {
    const container = stepRefs.current[index];
    if (!container) return [];
    return Array.from(
      container.querySelectorAll<HTMLElement>("input, select, textarea"),
    ).filter((element) => !(element as HTMLInputElement).disabled);
  }

  function validateStep(index: number): boolean {
    const fields = fieldsForStep(index);
    for (const field of fields) {
      const control = field as HTMLInputElement;
      if (!control.checkValidity()) {
        control.reportValidity();
        setStepError(control.validationMessage || "Complete the required fields in this step.");
        control.focus();
        return false;
      }
    }
    setStepError(null);
    return true;
  }

  function goToStep(next: number) {
    if (next > maxStep) return;
    if (next === REVIEW_STEP && formRef.current) {
      setReviewDraft(draftFromForm(formRef.current));
    }
    setStep(next);
    setStepError(null);
  }

  function continueStep() {
    if (!validateStep(step)) return;
    if (step < STEPS.length - 1) {
      const next = step + 1;
      setStep(next);
      setMaxStep((current) => Math.max(current, next));
      return;
    }
    const form = formRef.current;
    if (form) {
      setReviewDraft(draftFromForm(form));
      setStep(REVIEW_STEP);
      setMaxStep(REVIEW_STEP);
      setStepError(null);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const saving = submitter?.dataset.intent === "save";
    if (!saving && step < REVIEW_STEP) {
      event.preventDefault();
      continueStep();
      return;
    }
    if (!saving && publish) {
      const draft = formRef.current ? draftFromForm(formRef.current) : {};
      const check = checkPublishable(draft);
      if (!check.ok) {
        event.preventDefault();
        setStepError(`Before publishing, complete: ${check.missing.join(", ")}.`);
        return;
      }
    }
    manualSaveRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  }

  const allowanceText =
    vacancy?.allowances
      .map((a) => [a.label, a.amount ?? "", a.note ?? ""].join(" | ").replace(/ \| $/, ""))
      .join("\n") ?? "";

  const reviewMissing = missingKeyFields(reviewDraft);
  const reviewAnswered = KEY_FIELDS.length - reviewMissing.length;
  const publishability = checkPublishable(reviewDraft);
  const disclosurePercent = computeInfoScore(reviewDraft);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      onChange={queueAutosave}
      onInput={queueAutosave}
      noValidate
      className="space-y-4"
    >
      <input type="hidden" name="vacancyId" value={draftId} />
      <input type="hidden" name="expectedUpdatedAt" value={expectedUpdatedAt} />

      <div className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs" aria-label="Vacancy steps">
            {STEPS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => goToStep(index)}
                  aria-current={step === index ? "step" : undefined}
                  className={`rounded-full px-2.5 py-1 transition ${
                    step === index
                      ? "bg-brand-solid text-white"
                      : index <= maxStep
                        ? "text-ink-soft hover:bg-paper"
                        : "text-muted"
                  }`}
                  disabled={index > maxStep}
                >
                  {index + 1}. {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => goToStep(REVIEW_STEP)}
                aria-current={step === REVIEW_STEP ? "step" : undefined}
                className={`rounded-full px-2.5 py-1 transition ${
                  step === REVIEW_STEP ? "bg-brand-solid text-white" : "text-muted"
                }`}
                disabled={maxStep < REVIEW_STEP}
              >
                Review
              </button>
            </li>
          </ol>
          <div className="text-xs" aria-live="polite">
            {!isDraft ? (
              <span className="text-muted">Autosave is off while this vacancy is live.</span>
            ) : saveState === "saving" ? (
              <span className="inline-flex items-center gap-1.5 text-muted">
                <Loader2 size={12} className="animate-spin" /> Saving draft…
              </span>
            ) : saveState === "saved" ? (
              <span className="inline-flex items-center gap-1.5 text-success">
                <Check size={12} /> {saveMessage}{savedAt ? ` · ${savedAt}` : ""}
              </span>
            ) : saveState === "conflict" || saveState === "error" ? (
              <span className="inline-flex items-center gap-1.5 text-danger">
                <AlertTriangle size={12} /> {saveMessage}
              </span>
            ) : (
              <span className="text-muted">
                {vacancy ? `Step ${Math.min(step + 1, 5)} of 5` : "Draft autosaves as you type"}
              </span>
            )}
          </div>
        </div>
      </div>

      {stepError ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-warning/25 bg-warning-soft p-3 text-sm text-warning">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" /> {stepError}
        </p>
      ) : null}

      <div ref={(element) => { stepRefs.current[0] = element; }} hidden={step !== 0}>
        <Card>
          <CardHeader>
            <CardTitle>Job basics</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="title" required>Job title</Label>
              <Input id="title" name="title" defaultValue={vacancy?.title ?? ""} placeholder="International C+E reefer driver" required />
            </div>
            <div>
              <Label htmlFor="country" required>Employment country</Label>
              <Select id="country" name="country" defaultValue={vacancy?.country ?? defaultCountry} required>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="city">City / operating base</Label>
              <Input id="city" name="city" defaultValue={vacancy?.city ?? ""} placeholder="Rotterdam" />
            </div>
            <div>
              <Label htmlFor="transportCategory" required>Transport category</Label>
              <Select id="transportCategory" name="transportCategory" defaultValue={vacancy?.transportCategory ?? "reefer"}>
                {TRANSPORT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="contractType" required>Contract type</Label>
              <Select id="contractType" name="contractType" defaultValue={vacancy?.contractType ?? "permanent"}>
                {CONTRACT_TYPES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="contractingEntity" required>Contracting legal entity</Label>
              <Input
                id="contractingEntity"
                name="contractingEntity"
                defaultValue={vacancy?.contractingEntity ?? defaultContractingEntity}
                required
              />
              <HelpText>Shown to drivers. Must be the entity that signs the employment contract.</HelpText>
            </div>
            <div>
              <Label htmlFor="licenceRequirements" hint="comma separated">Licence requirements</Label>
              <Input id="licenceRequirements" name="licenceRequirements" defaultValue={vacancy?.licenceRequirements.join(", ") ?? "C+E"} placeholder="C+E, Code 95, ADR" />
            </div>
            <div>
              <Label htmlFor="experienceRequirements">Experience required</Label>
              <Input id="experienceRequirements" name="experienceRequirements" defaultValue={vacancy?.experienceRequirements ?? ""} placeholder="2 years international driving" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div ref={(element) => { stepRefs.current[1] = element; }} hidden={step !== 1}>
        <Card>
          <CardHeader>
            <CardTitle>Pay and employment</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="grossPayMin" hint="EUR">Gross minimum</Label>
              <Input id="grossPayMin" name="grossPayMin" type="number" min={0} step={50} defaultValue={vacancy?.grossPayMin ?? ""} placeholder="2800" />
            </div>
            <div>
              <Label htmlFor="grossPayMax" hint="EUR">Gross maximum</Label>
              <Input id="grossPayMax" name="grossPayMax" type="number" min={0} step={50} defaultValue={vacancy?.grossPayMax ?? ""} placeholder="3200" />
            </div>
            <div>
              <Label htmlFor="payPeriod" required>Pay period</Label>
              <Select id="payPeriod" name="payPeriod" defaultValue={vacancy?.payPeriod ?? "month"}>
                {PAY_PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>
            <div className="sm:col-span-3">
              <p className="rounded-xl bg-paper px-4 py-3 text-xs leading-relaxed text-muted">
                A gross minimum and maximum are required to publish. If the pay is a single figure, enter
                the same amount in both fields. The range is shown to drivers as advertised gross pay, not
                as a net estimate.
              </p>
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="payStructure">How is pay built up?</Label>
              <Textarea
                id="payStructure"
                name="payStructure"
                rows={4}
                defaultValue={vacancy?.payStructure ?? ""}
                placeholder="Basic monthly salary, paid 12 times per year, plus €X net per night out. Overtime after 40 hours at 125%. Holiday allowance 8% accrued monthly."
              />
              <HelpText>State the components separately. Never present gross as net.</HelpText>
            </div>
            <div className="sm:col-span-3">
              <Label htmlFor="allowances" hint="one per line">Allowances & extras</Label>
              <Textarea
                id="allowances"
                name="allowances"
                rows={3}
                defaultValue={allowanceText}
                placeholder={"Night-out allowance | 55 | net per night\nTravel allowance | 150 | monthly"}
              />
              <HelpText>Format: Label | amount in EUR | optional note. Leave the amount blank for non-cash items.</HelpText>
            </div>
            <div className="sm:col-span-3 rounded-xl bg-paper p-3 text-xs leading-relaxed text-muted">
              Gross minimum and maximum are mandatory before publishing. Deductions and net estimates must be labelled as such.
            </div>
          </CardBody>
        </Card>
      </div>

      <div ref={(element) => { stepRefs.current[2] = element; }} hidden={step !== 2}>
        <Card>
          <CardHeader>
            <CardTitle>Working arrangements and rest</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="workingPattern">Working pattern</Label>
              <Input id="workingPattern" name="workingPattern" defaultValue={vacancy?.workingPattern ?? ""} placeholder="International tramping, Mon–Fri" />
            </div>
            <div>
              <Label htmlFor="rotation">Rotation</Label>
              <Input id="rotation" name="rotation" defaultValue={vacancy?.rotation ?? ""} placeholder="3 weeks out / 1 week home" />
            </div>
            <div>
              <Label htmlFor="homeTime">Home time</Label>
              <Input id="homeTime" name="homeTime" defaultValue={vacancy?.homeTime ?? ""} placeholder="Weekends at home, 2–3 days per rotation" />
            </div>
            <div>
              <Label htmlFor="weeklyRest">Weekly rest arrangements</Label>
              <Input id="weeklyRest" name="weeklyRest" defaultValue={vacancy?.weeklyRest ?? ""} placeholder="Truck parked at depot; hotel provided for 45h rest" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="accommodation" required>Accommodation</Label>
              <Select id="accommodation" name="accommodation" defaultValue={vacancy?.accommodation ?? "not_disclosed"}>
                {ACCOMMODATION_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </Select>
              <HelpText>“Not disclosed” blocks publication: drivers need this answer.</HelpText>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="accommodationDetails">Accommodation details</Label>
              <Input id="accommodationDetails" name="accommodationDetails" defaultValue={vacancy?.accommodationDetails ?? ""} placeholder="Shared apartment, €350/month deducted, single room" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div ref={(element) => { stepRefs.current[3] = element; }} hidden={step !== 3}>
        <Card>
          <CardHeader>
            <CardTitle>Duties, vehicle and routes</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="loadingUnloading" required>Loading / unloading</Label>
              <Select id="loadingUnloading" name="loadingUnloading" defaultValue={vacancy?.loadingUnloading ?? "none"}>
                {LOADING_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="vehicleType">Vehicle</Label>
              <Input id="vehicleType" name="vehicleType" defaultValue={vacancy?.vehicleType ?? ""} placeholder="Volvo FH 2022, 4x2" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="equipment">Equipment details</Label>
              <Textarea id="equipment" name="equipment" rows={3} defaultValue={vacancy?.equipment ?? ""} placeholder="Thermoking SLXi, tail lift, pallet truck, ADR kit" />
            </div>
            <div>
              <Label htmlFor="operatingCountries" hint="comma separated">Operating countries</Label>
              <Input id="operatingCountries" name="operatingCountries" defaultValue={vacancy?.operatingCountries.join(", ") ?? ""} placeholder="NL, BE, DE, DK" />
            </div>
            <div>
              <Label htmlFor="languagesRequired" hint="comma separated">Languages required</Label>
              <Input id="languagesRequired" name="languagesRequired" defaultValue={vacancy?.languagesRequired.join(", ") ?? ""} placeholder="English, Dutch" />
            </div>
            <div>
              <Label htmlFor="trainingProvided">Training provided</Label>
              <Input id="trainingProvided" name="trainingProvided" defaultValue={vacancy?.trainingProvided ?? ""} placeholder="ADR refresher, company induction" />
            </div>
            <div>
              <Label htmlFor="benefits">Benefits</Label>
              <Input id="benefits" name="benefits" defaultValue={vacancy?.benefits ?? ""} placeholder="Pension, health insurance, fuel card" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div ref={(element) => { stepRefs.current[4] = element; }} hidden={step !== 4}>
        <Card>
          <CardHeader>
            <CardTitle>Application and contact</CardTitle>
          </CardHeader>
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="applicationMethod" required>Application method</Label>
              <Select
                id="applicationMethod"
                name="applicationMethod"
                value={method}
                onChange={(event) => setMethod(event.target.value as typeof method)}
              >
                {APPLICATION_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
            </div>
            {method === "external_link" ? (
              <div className="sm:col-span-2">
                <Label htmlFor="applicationUrl" required>Application URL</Label>
                <Input id="applicationUrl" name="applicationUrl" type="url" defaultValue={vacancy?.applicationUrl ?? ""} placeholder="https://your-company.example/careers/driver" />
              </div>
            ) : null}
            {method === "email" ? (
              <div className="sm:col-span-2">
                <Label htmlFor="applicationEmail" required>Recruitment email</Label>
                <Input id="applicationEmail" name="applicationEmail" type="email" defaultValue={vacancy?.applicationEmail ?? ""} placeholder="recruitment@your-company.example" />
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <Label htmlFor="contactName">Contact person</Label>
              <Input id="contactName" name="contactName" defaultValue={vacancy?.contactName ?? ""} placeholder="Name shown to drivers" />
            </div>
          </CardBody>
        </Card>
      </div>

      <div hidden={step !== REVIEW_STEP}>
        <Card>
          <CardHeader>
            <CardTitle>Review before publishing</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="rounded-xl bg-paper p-4 text-sm">
              <p className="font-medium">Disclosure completeness</p>
              <p className="mt-1 text-muted">
                {reviewAnswered} of {KEY_FIELDS.length} key conditions answered
                {disclosurePercent < 100 ? ` (${disclosurePercent}% of the key fields)` : ""}.
                The structured template is a disclosure structure, not a trust score.
              </p>
              {reviewMissing.length > 0 ? (
                <div className="mt-3">
                  <p className="text-xs font-medium text-warning">Not disclosed</p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {reviewMissing.map((field) => (
                      <li key={String(field)} className="rounded-full bg-warning-soft px-2 py-0.5 text-xs text-warning">
                        {keyFieldLabel(field)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2 text-xs text-success">Every key condition has an answer.</p>
              )}
            </div>

            <div className="rounded-xl bg-paper p-4 text-sm">
              <p className="font-medium">Publication eligibility</p>
              {publishability.ok ? (
                <p className="mt-1 flex items-center gap-1.5 text-success">
                  <Check size={13} /> All current mandatory publication requirements are met.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-warning">Not publishable yet. Missing mandatory fields:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-ink-soft">
                    {publishability.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <div className="rounded-xl bg-paper p-4 text-sm">
              <p className="flex items-center gap-1.5 font-medium">
                <ShieldCheck size={14} /> Evidence status
              </p>
              <p className="mt-1 text-muted">
                Company identity: {companyVerificationLabel}.{" "}
                {companyVerified
                  ? "Identity checks are complete."
                  : "Identity checks are not complete; the vacancy is labelled accordingly."}
              </p>
              <p className="mt-1 text-xs text-muted">
                Vacancy conditions are employer-declared and dated. No field-level evidence is attached to
                this vacancy; none is implied by publishing it.
              </p>
            </div>

            <div className="rounded-2xl border border-line p-4">
              <Checkbox
                name="intendToPublish"
                label="Publish this vacancy now"
                hint="Leave unticked to keep it as a draft. Publishing requires the mandatory fields above."
                checked={publish}
                onChange={(event) => setPublish(event.target.checked)}
              />
              {publish ? (
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-warning-soft p-3 text-xs leading-relaxed text-ink-soft">
                  <AlertTriangle size={13} className="mt-0.5 shrink-0 text-warning" />
                  You are confirming this role is genuinely open. Reconfirm it every 30 days or it will be
                  flagged as overdue.
                </p>
              ) : null}
            </div>

            <FieldError>{state?.error}</FieldError>
            {state?.error ? null : null}
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {step > 0 ? (
          <Button type="button" variant="secondary" onClick={() => goToStep(step - 1)}>
            <ChevronLeft size={15} /> Back
          </Button>
        ) : null}
        {step < REVIEW_STEP ? (
          <Button type="button" onClick={continueStep}>
            Continue <ChevronRight size={15} />
          </Button>
        ) : null}
        {step !== REVIEW_STEP ? (
          <Button type="submit" variant="secondary" data-intent="save" disabled={pending || saveState === "conflict"}>
            <Save size={15} /> {pending ? "Saving…" : "Save draft"}
          </Button>
        ) : null}
        {saveState === "conflict" ? (
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            Reload draft
          </Button>
        ) : null}
        {step === REVIEW_STEP ? (
          <Button
            type="submit"
            disabled={pending || saveState === "conflict" || (publish && !publishability.ok)}
            title={publish && !publishability.ok ? "Complete the mandatory fields before publishing." : undefined}
          >
            {publish ? <Send size={15} /> : <Save size={15} />}
            {pending ? "Saving…" : publish ? "Publish vacancy" : "Save draft"}
          </Button>
        ) : null}
        <p className="text-xs text-muted">
          {vacancy ? `Current status: ${vacancy.status.replaceAll("_", " ")}` : "Drafts are private and can be completed later."}
        </p>
      </div>

      <FieldError>{state?.error}</FieldError>
    </form>
  );
}
