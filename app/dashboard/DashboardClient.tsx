"use client";

import { useMemo, useState } from "react";
import type { Application, WorkHistoryItem } from "./page";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function DetailRow({
  label,
  value,
  tinted = false,
}: {
  label: string;
  value?: string | null;
  tinted?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        tinted ? "border-lime-100 bg-lime-50" : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
        {value?.trim() ? value : "—"}
      </div>
    </div>
  );
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "full" | "part" | "referral";
}) {
  const classes =
    variant === "full"
      ? "border-lime-200 bg-lime-50 text-lime-800"
      : variant === "part"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : variant === "referral"
      ? "border-blue-200 bg-blue-50 text-blue-800"
      : "border-gray-200 bg-white text-gray-700";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${classes}`}>
      {children}
    </span>
  );
}

function WorkHistoryCard({ job, index }: { job: WorkHistoryItem; index: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 text-sm font-bold text-gray-900">
        Employer {index + 1}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <DetailRow label="Company Name" value={job.company_name} tinted />
        <DetailRow label="Position" value={job.position} tinted />
        <DetailRow label="Company Phone" value={job.company_phone} />
        <DetailRow label="May We Contact?" value={job.may_contact_reference} />
        <DetailRow label="Start Date" value={formatDate(job.start_date)} />
        <DetailRow label="End Date" value={formatDate(job.end_date)} />
      </div>

      <div className="mt-4 grid gap-4">
        <DetailRow label="Responsibilities" value={job.responsibilities} />
        <DetailRow label="Reason for Leaving" value={job.reason_for_leaving} />
      </div>
    </div>
  );
}

export default function DashboardClient({
  applications,
}: {
  applications: Application[];
}) {
  const [search, setSearch] = useState("");
  const [companyFilter, setCompanyFilter] = useState("All");

  const companies = useMemo(() => {
    const values = Array.from(
      new Set(applications.map((app) => app.company).filter(Boolean))
    );
    return ["All", ...values];
  }, [applications]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesCompany =
        companyFilter === "All" || app.company === companyFilter;

      const workHistoryText =
        app.work_history?.map((job) => [job.company_name, job.position].join(" ")).join(" ") || "";

      const haystack = [
        app.full_name,
        app.email,
        app.phone,
        app.company,
        app.preferred_location,
        app.referred_by,
        app.employment_type,
        workHistoryText,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());

      return matchesCompany && matchesSearch;
    });
  }, [applications, companyFilter, search]);

  const fullTimeCount = applications.filter(
    (app) => app.employment_type === "Full-Time"
  ).length;

  const partTimeCount = applications.filter(
    (app) => app.employment_type === "Part-Time"
  ).length;

  return (
    <>
      <div className="mb-6 grid gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm text-gray-500">Total Applications</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            {applications.length}
          </div>
        </div>

        <div className="rounded-2xl border border-lime-200 bg-lime-50 p-4">
          <div className="text-sm text-lime-700">Full-Time</div>
          <div className="mt-1 text-3xl font-bold text-lime-900">
            {fullTimeCount}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="text-sm text-amber-700">Part-Time</div>
          <div className="mt-1 text-3xl font-bold text-amber-900">
            {partTimeCount}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm text-gray-500">Blue Ridge Olive Oil</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            {
              applications.filter(
                (app) => app.company === "Blue Ridge Olive Oil Company"
              ).length
            }
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_220px]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Search Applicants
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, location, referral, employment type, or company name"
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none focus:border-gray-800"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Company
          </label>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-black outline-none focus:border-gray-800"
          >
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500">
            No applications found.
          </div>
        ) : (
          filteredApplications.map((app) => (
            <details
              key={app.id}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <summary className="cursor-pointer list-none p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {app.full_name || "Unnamed Applicant"}
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>{app.company || "—"}</Badge>
                      <Badge>{app.preferred_location || "No location"}</Badge>
                      {app.employment_type === "Full-Time" && (
                        <Badge variant="full">Full-Time</Badge>
                      )}
                      {app.employment_type === "Part-Time" && (
                        <Badge variant="part">Part-Time</Badge>
                      )}
                      {app.referred_by && (
                        <Badge variant="referral">Referred</Badge>
                      )}
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 md:text-right">
                    <div>Submitted: {formatDateTime(app.created_at)}</div>
                    <div>Application Date: {formatDate(app.application_date)}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-4">
                  <div>
                    <span className="font-semibold text-gray-900">Email:</span>{" "}
                    {app.email || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Phone:</span>{" "}
                    {app.phone || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Employment:</span>{" "}
                    {app.employment_type || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Referred By:</span>{" "}
                    {app.referred_by || "—"}
                  </div>
                </div>
              </summary>

              <div className="border-t border-gray-200 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Full Name" value={app.full_name} tinted />
                  <DetailRow label="Company" value={app.company} tinted />
                  <DetailRow label="Email" value={app.email} />
                  <DetailRow label="Phone" value={app.phone} />
                  <DetailRow label="Address" value={app.address} />
                  <DetailRow
                    label="Preferred Location"
                    value={app.preferred_location}
                  />
                  <DetailRow
                    label="Employment Type"
                    value={app.employment_type}
                    tinted
                  />
                  <DetailRow
                    label="Weekend Availability"
                    value={app.weekend_availability}
                  />
                  <DetailRow label="Referred By" value={app.referred_by} tinted />
                  <DetailRow label="Start Date" value={formatDate(app.start_date)} />
                  <DetailRow
                    label="Enjoys Public Interaction"
                    value={app.enjoys_public_interaction}
                  />
                  <DetailRow
                    label="Physical Requirements Acknowledged"
                    value={app.physical_requirements_acknowledged}
                  />
                  <DetailRow
                    label="Non-Smoking Acknowledged"
                    value={app.non_smoking_acknowledged}
                  />
                  <DetailRow
                    label="Application Date"
                    value={formatDate(app.application_date)}
                  />
                  <DetailRow label="Signature" value={app.signature} />
                </div>

                <div className="mt-4 grid gap-4">
                  <DetailRow
                    label="Computer / Retail System Experience"
                    value={app.computer_experience}
                  />
                  <DetailRow
                    label="Why They Want to Work Here"
                    value={app.why_company}
                    tinted
                  />
                </div>

                <div className="mt-6">
                  <h3 className="mb-4 text-lg font-bold text-gray-900">
                    Work History
                  </h3>

                  <div className="space-y-4">
                    {app.work_history && app.work_history.length > 0 ? (
                      [...app.work_history]
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((job, index) => (
                          <WorkHistoryCard key={job.id} job={job} index={index} />
                        ))
                    ) : (
                      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                        No work history provided.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </details>
          ))
        )}
      </div>
    </>
  );
}