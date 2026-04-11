"use client";

import { useMemo, useState } from "react";
import type { Application } from "./page";

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
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
        {value?.trim() ? value : "—"}
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700">
      {children}
    </span>
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

      const haystack = [
        app.full_name,
        app.email,
        app.phone,
        app.company,
        app.preferred_location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());

      return matchesCompany && matchesSearch;
    });
  }, [applications, companyFilter, search]);

  return (
    <>
      <div className="mb-6 grid gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm text-gray-500">Total Applications</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            {applications.length}
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

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <div className="text-sm text-gray-500">Tupelo Tea</div>
          <div className="mt-1 text-3xl font-bold text-gray-900">
            {applications.filter((app) => app.company === "Tupelo Tea").length}
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
            placeholder="Search by name, email, phone, or location"
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
                      <Badge>Start: {formatDate(app.start_date)}</Badge>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 md:text-right">
                    <div>Submitted: {formatDateTime(app.created_at)}</div>
                    <div>Application Date: {formatDate(app.application_date)}</div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-gray-700 md:grid-cols-3">
                  <div>
                    <span className="font-semibold text-gray-900">Email:</span>{" "}
                    {app.email || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Phone:</span>{" "}
                    {app.phone || "—"}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">
                      Weekend Availability:
                    </span>{" "}
                    {app.weekend_availability || "—"}
                  </div>
                </div>
              </summary>

              <div className="border-t border-gray-200 p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Full Name" value={app.full_name} />
                  <DetailRow label="Company" value={app.company} />
                  <DetailRow label="Email" value={app.email} />
                  <DetailRow label="Phone" value={app.phone} />
                  <DetailRow label="Address" value={app.address} />
                  <DetailRow
                    label="Preferred Location"
                    value={app.preferred_location}
                  />
                  <DetailRow label="Availability" value={app.availability} />
                  <DetailRow
                    label="Weekend Availability"
                    value={app.weekend_availability}
                  />
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
                    label="Previous Work Experience"
                    value={app.work_experience}
                  />
                  <DetailRow
                    label="Computer / Retail System Experience"
                    value={app.computer_experience}
                  />
                  <DetailRow
                    label="Why They Want to Work Here"
                    value={app.why_company}
                  />
                </div>
              </div>
            </details>
          ))
        )}
      </div>
    </>
  );
}