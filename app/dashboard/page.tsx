import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import DashboardClient from "./DashboardClient";
import LogoutButton from "./LogoutButton";

export type Application = {
  id: number;
  created_at: string;
  company: string;
  full_name: string;
  address: string;
  phone: string;
  email: string;
  preferred_location: string;
  availability: string;
  weekend_availability: string;
  start_date: string;
  work_experience: string;
  computer_experience: string;
  why_company: string;
  enjoys_public_interaction: string;
  physical_requirements_acknowledged: string;
  non_smoking_acknowledged: string;
  signature: string;
  application_date: string;
};

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseKey);
}

async function getApplications(): Promise<Application[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Application[];
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get("dashboard_auth")?.value === "true";

  if (!isAuthed) {
    redirect("/dashboard/login");
  }

  const applications = await getApplications();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Applicant Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                View all submitted employment applications.
              </p>
            </div>

            <div className="sm:pt-1">
              <LogoutButton />
            </div>
          </div>
        </div>

        <DashboardClient applications={applications} />
      </div>
    </div>
  );
}