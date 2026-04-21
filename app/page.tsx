"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";

type Company = "Blue Ridge Olive Oil Company" | "Tupelo Tea" | "";
type EmploymentType = "Full-Time" | "Part-Time" | "";
type YesNo = "Yes" | "No" | "";

type WorkHistoryItem = {
  company_name: string;
  position: string;
  company_phone: string;
  responsibilities: string;
  start_date: string;
  end_date: string;
  reason_for_leaving: string;
  may_contact_reference: YesNo;
};

type FormData = {
  company: Company;
  full_name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  referred_by: string;
  preferred_location: string;
  employment_type: EmploymentType;
  weekend_availability: string;
  start_date: string;
  work_history: WorkHistoryItem[];
  computer_experience: string;
  why_company: string;
  enjoys_public_interaction: string;
  physical_requirements_acknowledged: string;
  non_smoking_acknowledged: string;
  signature: string;
  application_date: string;
};

const emptyWorkHistoryItem = (): WorkHistoryItem => ({
  company_name: "",
  position: "",
  company_phone: "",
  responsibilities: "",
  start_date: "",
  end_date: "",
  reason_for_leaving: "",
  may_contact_reference: "",
});

const initialForm: FormData = {
  company: "",
  full_name: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  email: "",
  referred_by: "",
  preferred_location: "",
  employment_type: "",
  weekend_availability: "",
  start_date: "",
  work_history: [emptyWorkHistoryItem()],
  computer_experience: "",
  why_company: "",
  enjoys_public_interaction: "",
  physical_requirements_acknowledged: "",
  non_smoking_acknowledged: "",
  signature: "",
  application_date: new Date().toISOString().split("T")[0],
};

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length === 0) return "";
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const phoneRef = useRef<HTMLInputElement | null>(null);

  const theme = useMemo(() => {
    if (form.company === "Blue Ridge Olive Oil Company") {
      return {
        name: "Blue Ridge Olive Oil Company",
        logo: "/brooc-logo.png",
        accent: "bg-lime-700",
        light: "bg-lime-50",
        section: "bg-lime-50 border-lime-200",
        border: "border-lime-200",
        text: "text-lime-900",
        ring: "focus:border-lime-700",
        button: "bg-lime-700 hover:bg-lime-800",
        softCard: "border-lime-100 bg-lime-50/60",
      };
    }

    if (form.company === "Tupelo Tea") {
      return {
        name: "Tupelo Tea",
        logo: "/tupelo-logo.png",
        accent: "bg-amber-600",
        light: "bg-amber-50",
        section: "bg-amber-50 border-amber-200",
        border: "border-amber-200",
        text: "text-amber-900",
        ring: "focus:border-amber-600",
        button: "bg-amber-600 hover:bg-amber-700",
        softCard: "border-amber-100 bg-amber-50/60",
      };
    }

    return {
      name: "",
      logo: "",
      accent: "bg-gray-800",
      light: "bg-white",
      section: "bg-gray-50 border-gray-200",
      border: "border-gray-200",
      text: "text-gray-900",
      ring: "focus:border-gray-800",
      button: "bg-gray-800 hover:bg-gray-900",
      softCard: "border-gray-200 bg-gray-50",
    };
  }, [form.company]);

  const inputClass = `w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-black outline-none sm:p-3 ${theme.ring}`;
  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";
  const sectionCardClass = `rounded-2xl border p-4 sm:p-5 ${theme.section}`;

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "state"
          ? value.toUpperCase()
          : name === "phone"
          ? formatPhoneInput(value)
          : value,
    }));
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 5);

    setForm((prev) => ({
      ...prev,
      zip: digits,
    }));

    if (digits.length === 5) {
      phoneRef.current?.focus();
    }
  };

  const updateWorkHistoryField = (
    index: number,
    field: keyof WorkHistoryItem,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      work_history: prev.work_history.map((job, i) =>
        i === index
          ? {
              ...job,
              [field]:
                field === "company_phone" ? formatPhoneInput(value) : value,
            }
          : job
      ),
    }));
  };

  const addWorkHistoryItem = () => {
    setForm((prev) => ({
      ...prev,
      work_history: [...prev.work_history, emptyWorkHistoryItem()],
    }));
  };

  const removeWorkHistoryItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      work_history:
        prev.work_history.length === 1
          ? [emptyWorkHistoryItem()]
          : prev.work_history.filter((_, i) => i !== index),
    }));
  };

  const chooseCompany = (company: Company) => {
    setForm({
      ...initialForm,
      company,
      preferred_location: company === "Tupelo Tea" ? "Blue Ridge" : "",
      application_date: new Date().toISOString().split("T")[0],
    });
    setStep(1);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const canContinueStep1 =
    form.full_name.trim() &&
    form.street.trim() &&
    form.city.trim() &&
    form.state.trim() &&
    form.zip.trim() &&
    form.phone.trim() &&
    form.email.trim();

  const canContinueStep2 =
    form.employment_type.trim() &&
    form.weekend_availability.trim() &&
    form.start_date.trim() &&
    (form.company === "Tupelo Tea" || form.preferred_location.trim());

  const hasValidFirstJob =
    form.work_history[0]?.company_name.trim() &&
    form.work_history[0]?.position.trim() &&
    form.work_history[0]?.responsibilities.trim() &&
    form.work_history[0]?.start_date.trim() &&
    form.work_history[0]?.end_date.trim() &&
    form.work_history[0]?.reason_for_leaving.trim() &&
    form.work_history[0]?.may_contact_reference.trim();

  const canContinueStep3 =
    hasValidFirstJob &&
    form.computer_experience.trim() &&
    form.why_company.trim();

  const canContinueStep4 =
    form.enjoys_public_interaction.trim() &&
    form.physical_requirements_acknowledged.trim() &&
    form.non_smoking_acknowledged.trim();

  const canSubmit =
    form.signature.trim() &&
    form.application_date.trim() &&
    form.company.trim();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) return;

    setLoading(true);

    try {
      const payload = {
        ...form,
        address: `${form.street}, ${form.city}, ${form.state} ${form.zip}`,
        preferred_location:
          form.company === "Tupelo Tea" ? "Blue Ridge" : form.preferred_location,
      };

      const response = await fetch("/api/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submit failed");
      }

      setSuccess(true);
      setForm({
        ...initialForm,
        application_date: new Date().toISOString().split("T")[0],
      });
      setStep(0);
    } catch (error) {
      console.error("Submit error:", error);
      alert("There was a problem submitting the application.");
    } finally {
      setLoading(false);
    }
  };

  const renderLogoHeader = () => {
    if (!form.company) return null;

    return (
      <div className="mb-5 flex flex-col items-center sm:mb-6">
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full bg-white shadow-md sm:h-28 sm:w-28">
          <Image
            src={theme.logo}
            alt={theme.name}
            fill
            className="object-contain p-2"
            sizes="112px"
            priority
          />
        </div>
        <h1 className={`text-center text-2xl font-bold ${theme.text} sm:text-3xl`}>
          {form.company} Employment Application
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please complete each step below.
        </p>
      </div>
    );
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-2xl rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-green-700">
              Application Submitted
            </h1>
            <p className="mt-3 text-gray-600">
              Thank you for applying. Donna Harper will review your information,
              and qualified applicants may be contacted for a preliminary phone
              interview.
            </p>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setSuccess(false)}
              className="rounded-xl bg-black px-6 py-3 text-white transition hover:bg-gray-800"
            >
              Submit Another Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-5 shadow-xl sm:p-8">
          <div className="mb-8 text-center sm:mb-10">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Join Our Team
            </h1>
            <p className="mt-3 text-base text-gray-600 sm:text-lg">
              Choose the company you would like to apply to.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 md:gap-6">
            <button
              type="button"
              onClick={() => chooseCompany("Blue Ridge Olive Oil Company")}
              className="rounded-3xl border border-lime-200 bg-lime-50 p-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
            >
              <div className="mb-5 flex justify-center">
                <div className="relative h-36 w-36 sm:h-44 sm:w-44">
                  <Image
                    src="/brooc-logo.png"
                    alt="Blue Ridge Olive Oil Company logo"
                    fill
                    className="object-contain"
                    sizes="176px"
                    priority
                  />
                </div>
              </div>
              <h2 className="text-center text-xl font-bold text-lime-900 sm:text-2xl">
                Blue Ridge Olive Oil Company
              </h2>
              <p className="mt-3 text-center text-sm text-gray-700">
                Apply for a position with Blue Ridge Olive Oil Company.
              </p>
            </button>

            <button
              type="button"
              onClick={() => chooseCompany("Tupelo Tea")}
              className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-left shadow-md transition hover:-translate-y-1 hover:shadow-xl sm:p-6"
            >
              <div className="mb-5 flex justify-center">
                <div className="relative h-36 w-36 sm:h-44 sm:w-44">
                  <Image
                    src="/tupelo-logo.png"
                    alt="Tupelo Tea logo"
                    fill
                    className="object-contain"
                    sizes="176px"
                    priority
                  />
                </div>
              </div>
              <h2 className="text-center text-xl font-bold text-amber-900 sm:text-2xl">
                Tupelo Tea
              </h2>
              <p className="mt-3 text-center text-sm text-gray-700">
                Apply for a position with Tupelo Tea.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 px-4 py-6 sm:py-8">
      <div
        className={`mx-auto max-w-3xl rounded-3xl border ${theme.border} bg-white p-5 shadow-xl sm:p-8`}
      >
        {renderLogoHeader()}

        <div className="mb-6 sm:mb-8">
          <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-600">
            <span>Step {step} of 5</span>
            <span>{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full rounded-full ${theme.accent} transition-all duration-300`}
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          {step === 1 && (
            <div className={sectionCardClass}>
              <h2 className={`mb-4 text-lg font-bold ${theme.text}`}>
                Contact Information
              </h2>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={updateField}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Street Address</label>
                  <input
                    name="street"
                    value={form.street}
                    onChange={updateField}
                    className={inputClass}
                    required
                    autoComplete="street-address"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  <div>
                    <label className={labelClass}>City</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={updateField}
                      className={inputClass}
                      required
                      autoComplete="address-level2"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      name="state"
                      value={form.state}
                      onChange={updateField}
                      className={inputClass}
                      required
                      maxLength={2}
                      autoComplete="address-level1"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Zip Code</label>
                    <input
                      name="zip"
                      value={form.zip}
                      onChange={handleZipChange}
                      className={inputClass}
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <input
                      ref={phoneRef}
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={updateField}
                      className={inputClass}
                      required
                      inputMode="tel"
                      autoComplete="tel"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={updateField}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Referred By</label>
                  <input
                    name="referred_by"
                    value={form.referred_by}
                    onChange={updateField}
                    className={inputClass}
                    placeholder="Employee, friend, customer, walk-in, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={sectionCardClass}>
              <h2 className={`mb-4 text-lg font-bold ${theme.text}`}>
                Position Details
              </h2>

              <div className="space-y-5">
                {form.company === "Blue Ridge Olive Oil Company" ? (
                  <div>
                    <label className={labelClass}>Preferred Location</label>
                    <select
                      name="preferred_location"
                      value={form.preferred_location}
                      onChange={updateField}
                      className={inputClass}
                      required
                    >
                      <option value="">Select a location</option>
                      <option value="Blue Ridge">Blue Ridge</option>
                      <option value="Ellijay">Ellijay</option>
                      <option value="Blairsville">Blairsville</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      value="Blue Ridge"
                      className={`${inputClass} bg-gray-50 text-gray-700`}
                      readOnly
                    />
                  </div>
                )}

                <div className={`rounded-2xl border p-4 ${theme.softCard}`}>
                  <label className={labelClass}>Employment Type</label>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {["Full-Time", "Part-Time"].map((option) => (
                      <label
                        key={option}
                        className="flex items-center gap-3 rounded-xl border border-white/70 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm"
                      >
                        <input
                          type="radio"
                          name="employment_type"
                          value={option}
                          checked={form.employment_type === option}
                          onChange={updateField}
                          className="h-4 w-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Are You Available to Work Weekends?
                  </label>
                  <select
                    name="weekend_availability"
                    value={form.weekend_availability}
                    onChange={updateField}
                    className={inputClass}
                    required
                  >
                    <option value="">Select one</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Sometimes">Sometimes</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Available Start Date</label>
                  <input
                    name="start_date"
                    type="date"
                    value={form.start_date}
                    onChange={updateField}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={sectionCardClass}>
              <h2 className={`mb-4 text-lg font-bold ${theme.text}`}>
                Work History
              </h2>

              <div className="space-y-5">
                {form.work_history.map((job, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border p-4 sm:p-5 ${theme.softCard}`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className={`text-base font-bold ${theme.text}`}>
                        Employer {index + 1}
                      </h3>
                      {form.work_history.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeWorkHistoryItem(index)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Company Name</label>
                          <input
                            value={job.company_name}
                            onChange={(e) =>
                              updateWorkHistoryField(
                                index,
                                "company_name",
                                e.target.value
                              )
                            }
                            className={inputClass}
                            required={index === 0}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Position</label>
                          <input
                            value={job.position}
                            onChange={(e) =>
                              updateWorkHistoryField(
                                index,
                                "position",
                                e.target.value
                              )
                            }
                            className={inputClass}
                            required={index === 0}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Company Phone Number</label>
                        <input
                          type="tel"
                          value={job.company_phone}
                          onChange={(e) =>
                            updateWorkHistoryField(
                              index,
                              "company_phone",
                              e.target.value
                            )
                          }
                          className={inputClass}
                          inputMode="tel"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Responsibilities</label>
                        <textarea
                          value={job.responsibilities}
                          onChange={(e) =>
                            updateWorkHistoryField(
                              index,
                              "responsibilities",
                              e.target.value
                            )
                          }
                          rows={4}
                          className={inputClass}
                          required={index === 0}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>Start Date</label>
                          <input
                            type="date"
                            value={job.start_date}
                            onChange={(e) =>
                              updateWorkHistoryField(
                                index,
                                "start_date",
                                e.target.value
                              )
                            }
                            className={inputClass}
                            required={index === 0}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>End Date</label>
                          <input
                            type="date"
                            value={job.end_date}
                            onChange={(e) =>
                              updateWorkHistoryField(
                                index,
                                "end_date",
                                e.target.value
                              )
                            }
                            className={inputClass}
                            required={index === 0}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelClass}>Reason for Leaving</label>
                        <textarea
                          value={job.reason_for_leaving}
                          onChange={(e) =>
                            updateWorkHistoryField(
                              index,
                              "reason_for_leaving",
                              e.target.value
                            )
                          }
                          rows={3}
                          className={inputClass}
                          required={index === 0}
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          May We Contact for Reference?
                        </label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {["Yes", "No"].map((option) => (
                            <label
                              key={option}
                              className="flex items-center gap-3 rounded-xl border border-white/70 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-sm"
                            >
                              <input
                                type="radio"
                                name={`may_contact_reference_${index}`}
                                value={option}
                                checked={job.may_contact_reference === option}
                                onChange={(e) =>
                                  updateWorkHistoryField(
                                    index,
                                    "may_contact_reference",
                                    e.target.value
                                  )
                                }
                                className="h-4 w-4"
                              />
                              <span>{option}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addWorkHistoryItem}
                  className="rounded-xl border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  + Add Another Employer
                </button>

                <div className={`rounded-2xl border p-4 ${theme.softCard}`}>
                  <label className={labelClass}>
                    Computer / Retail System Experience
                  </label>
                  <textarea
                    name="computer_experience"
                    value={form.computer_experience}
                    onChange={updateField}
                    rows={4}
                    placeholder="Please tell us about your comfort with computers, POS systems, or retail operations."
                    className={inputClass}
                    required
                  />
                </div>

                <div className={`rounded-2xl border p-4 ${theme.softCard}`}>
                  <label className={labelClass}>
                    Why Would You Like to Work for{" "}
                    {form.company === "Tupelo Tea"
                      ? "Tupelo Tea"
                      : "Blue Ridge Olive Oil Company"}
                    ?
                  </label>
                  <textarea
                    name="why_company"
                    value={form.why_company}
                    onChange={updateField}
                    rows={4}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={sectionCardClass}>
              <h2 className={`mb-4 text-lg font-bold ${theme.text}`}>
                Preliminary Screening
              </h2>

              <div className="space-y-5">
                <div>
                  <label className={labelClass}>
                    Do you enjoy interacting with the public?
                  </label>
                  <select
                    name="enjoys_public_interaction"
                    value={form.enjoys_public_interaction}
                    onChange={updateField}
                    className={inputClass}
                    required
                  >
                    <option value="">Select one</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Can you stand, stoop, reach, and lift up to 35 lbs?
                  </label>
                  <select
                    name="physical_requirements_acknowledged"
                    value={form.physical_requirements_acknowledged}
                    onChange={updateField}
                    className={inputClass}
                    required
                  >
                    <option value="">Select one</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Do you understand this is a non-smoking work environment and
                    that smoking is not permitted on the premises or during working
                    hours?
                  </label>
                  <select
                    name="non_smoking_acknowledged"
                    value={form.non_smoking_acknowledged}
                    onChange={updateField}
                    className={inputClass}
                    required
                  >
                    <option value="">Select one</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className={sectionCardClass}>
              <h2 className={`mb-4 text-lg font-bold ${theme.text}`}>
                Final Review
              </h2>

              <div className="space-y-5">
                <p className="text-sm text-gray-700">
                  By signing below, you confirm that the information provided is
                  true to the best of your knowledge.
                </p>

                <div>
                  <label className={labelClass}>Typed Signature</label>
                  <input
                    name="signature"
                    value={form.signature}
                    onChange={updateField}
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Application Date</label>
                  <input
                    name="application_date"
                    type="date"
                    value={form.application_date}
                    onChange={updateField}
                    className={inputClass}
                    required
                  />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white/80 p-4 text-sm text-gray-700">
                  <p>
                    Qualified applicants may be contacted by Donna Harper for a
                    preliminary phone interview, with a physical interview to
                    follow.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-between sm:pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Back
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (step === 1 && !canContinueStep1) ||
                  (step === 2 && !canContinueStep2) ||
                  (step === 3 && !canContinueStep3) ||
                  (step === 4 && !canContinueStep4)
                }
                className={`rounded-xl px-6 py-3 font-semibold text-white transition ${theme.button} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className={`rounded-xl px-6 py-3 font-semibold text-white transition ${theme.button} disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}