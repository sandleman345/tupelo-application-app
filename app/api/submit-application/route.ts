import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  return phone;
}

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }

    if (!resendApiKey) {
      console.error("Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Missing RESEND_API_KEY" },
        { status: 500 }
      );
    }

    const data = await req.json();
    console.log("Incoming data:", data);

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    const insertData = {
      company: data.company,
      full_name: data.full_name,
      address: data.address,
      phone: formatPhone(data.phone ?? ""),
      email: data.email,
      referred_by: data.referred_by,
      preferred_location: data.preferred_location,
      employment_type: data.employment_type,
      weekend_availability: data.weekend_availability,
      start_date: data.start_date,
      computer_experience: data.computer_experience,
      why_company: data.why_company,
      enjoys_public_interaction: data.enjoys_public_interaction,
      physical_requirements_acknowledged:
        data.physical_requirements_acknowledged,
      non_smoking_acknowledged: data.non_smoking_acknowledged,
      signature: data.signature,
      application_date: data.application_date,
    };

    const { data: applicationInsert, error } = await supabase
      .from("applications")
      .insert([insertData])
      .select("id")
      .single();

    if (error || !applicationInsert) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: error?.message || "Failed to create application" },
        { status: 500 }
      );
    }

    const workHistoryRows =
      Array.isArray(data.work_history) && data.work_history.length > 0
        ? data.work_history
            .filter(
              (job: any) =>
                job.company_name ||
                job.position ||
                job.company_phone ||
                job.responsibilities ||
                job.start_date ||
                job.end_date ||
                job.reason_for_leaving ||
                job.may_contact_reference
            )
            .map((job: any, index: number) => ({
              application_id: applicationInsert.id,
              sort_order: index,
              company_name: job.company_name || "",
              position: job.position || "",
              company_phone: formatPhone(job.company_phone || ""),
              responsibilities: job.responsibilities || "",
              start_date: job.start_date || null,
              end_date: job.end_date || null,
              reason_for_leaving: job.reason_for_leaving || "",
              may_contact_reference: job.may_contact_reference || "",
            }))
        : [];

    if (workHistoryRows.length > 0) {
      const { error: workHistoryError } = await supabase
        .from("application_work_history")
        .insert(workHistoryRows);

      if (workHistoryError) {
        console.error("Work history insert error:", workHistoryError);
        return NextResponse.json(
          { error: workHistoryError.message },
          { status: 500 }
        );
      }
    }

    const brandColor =
      data.company === "Tupelo Tea" ? "#d97706" : "#4d7c0f";

    const dashboardUrl =
      process.env.NODE_ENV === "production"
        ? "https://tupelo-application-app.vercel.app/dashboard"
        : "http://localhost:3000/dashboard";

    const workHistoryHtml =
      workHistoryRows.length > 0
        ? workHistoryRows
            .map(
              (job, index) => `
                <div style="border:1px solid #e5e7eb; border-radius:12px; padding:14px 16px; margin-bottom:12px; background:${index % 2 === 0 ? "#f9fafb" : "#ffffff"};">
                  <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; margin-bottom:8px;">Employer ${index + 1}</div>
                  <p style="margin:4px 0;"><strong>Company:</strong> ${job.company_name || "—"}</p>
                  <p style="margin:4px 0;"><strong>Position:</strong> ${job.position || "—"}</p>
                  <p style="margin:4px 0;"><strong>Company Phone:</strong> ${job.company_phone || "—"}</p>
                  <p style="margin:4px 0;"><strong>Start Date:</strong> ${job.start_date || "—"}</p>
                  <p style="margin:4px 0;"><strong>End Date:</strong> ${job.end_date || "—"}</p>
                  <p style="margin:4px 0;"><strong>May We Contact:</strong> ${job.may_contact_reference || "—"}</p>
                  <p style="margin:8px 0 4px;"><strong>Responsibilities:</strong></p>
                  <div style="white-space:pre-wrap; line-height:1.6;">${job.responsibilities || "—"}</div>
                  <p style="margin:8px 0 4px;"><strong>Reason for Leaving:</strong></p>
                  <div style="white-space:pre-wrap; line-height:1.6;">${job.reason_for_leaving || "—"}</div>
                </div>
              `
            )
            .join("")
        : `<div style="border:1px solid #e5e7eb; border-radius:12px; padding:14px 16px; background:#f9fafb;">No work history provided.</div>`;

    const emailResult = await resend.emails.send({
      from: "Applications <jobs@blueridgeoliveoil.com>",
      to: [
        "tom@blueridgeoliveoil.com",
        "donna@blueridgeoliveoil.com",
      ],
      subject: `New Application - ${data.full_name}`,
      html: `
        <div style="margin:0; padding:24px; background-color:#f3f4f6; font-family:Arial, Helvetica, sans-serif; color:#111827;">
          <div style="max-width:760px; margin:0 auto; background:#ffffff; border-radius:18px; overflow:hidden; border:1px solid #e5e7eb; box-shadow:0 8px 24px rgba(0,0,0,0.06);">

            <div style="background:${brandColor}; padding:28px 32px; color:#ffffff;">
              <div style="font-size:13px; letter-spacing:.08em; text-transform:uppercase; opacity:.9;">
                New Employment Application
              </div>
              <h1 style="margin:10px 0 6px; font-size:30px; line-height:1.2;">
                ${data.full_name ?? "Applicant"}
              </h1>
              <div style="font-size:16px; opacity:.95;">
                ${data.company ?? ""}
              </div>
            </div>

            <div style="padding:28px 32px;">

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:22px;">
                <tr>
                  <td style="padding:0 0 18px 0;">
                    <div style="font-size:18px; font-weight:700; color:#111827; margin-bottom:12px;">Contact Information</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="width:50%; padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Full Name</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.full_name ?? ""}</div>
                        </td>
                        <td style="width:50%; padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Email</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.email ?? ""}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; border:1px solid #e5e7eb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Phone</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${formatPhone(data.phone ?? "")}</div>
                        </td>
                        <td style="padding:10px 12px; border:1px solid #e5e7eb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Address</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.address ?? ""}</div>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Referred By</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.referred_by ?? "—"}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:22px;">
                <tr>
                  <td>
                    <div style="font-size:18px; font-weight:700; color:#111827; margin-bottom:12px;">Availability & Position Details</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="width:50%; padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Preferred Location</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.preferred_location ?? ""}</div>
                        </td>
                        <td style="width:50%; padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Start Date</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.start_date ?? ""}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:10px 12px; border:1px solid #e5e7eb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Employment Type</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.employment_type ?? ""}</div>
                        </td>
                        <td style="padding:10px 12px; border:1px solid #e5e7eb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Weekend Availability</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.weekend_availability ?? ""}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="margin-bottom:22px;">
                <div style="font-size:18px; font-weight:700; color:#111827; margin-bottom:12px;">Work History</div>
                ${workHistoryHtml}
              </div>

              <div style="margin-bottom:22px;">
                <div style="font-size:18px; font-weight:700; color:#111827; margin-bottom:12px;">Experience & Fit</div>

                <div style="border:1px solid #e5e7eb; border-radius:12px; padding:14px 16px; margin-bottom:12px; background:#ffffff;">
                  <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; margin-bottom:6px;">Computer / Retail System Experience</div>
                  <div style="font-size:15px; line-height:1.6; white-space:pre-wrap;">${data.computer_experience ?? ""}</div>
                </div>

                <div style="border:1px solid #e5e7eb; border-radius:12px; padding:14px 16px; background:#f9fafb;">
                  <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em; margin-bottom:6px;">Why They Want to Work Here</div>
                  <div style="font-size:15px; line-height:1.6; white-space:pre-wrap;">${data.why_company ?? ""}</div>
                </div>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; margin-bottom:22px;">
                <tr>
                  <td>
                    <div style="font-size:18px; font-weight:700; color:#111827; margin-bottom:12px;">Screening Responses</div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="width:33.33%; padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Public Interaction</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.enjoys_public_interaction ?? ""}</div>
                        </td>
                        <td style="width:33.33%; padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Physical Requirements</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.physical_requirements_acknowledged ?? ""}</div>
                        </td>
                        <td style="width:33.33%; padding:10px 12px; border:1px solid #e5e7eb; background:#f9fafb;">
                          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Non-Smoking Policy</div>
                          <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.non_smoking_acknowledged ?? ""}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="border-top:1px solid #e5e7eb; padding-top:18px;">
                <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap; margin-bottom:20px;">
                  <div>
                    <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Signature</div>
                    <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.signature ?? ""}</div>
                  </div>
                  <div>
                    <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Application Date</div>
                    <div style="font-size:15px; font-weight:600; margin-top:4px;">${data.application_date ?? ""}</div>
                  </div>
                </div>

                <div style="text-align:center; margin-top:8px;">
                  <a
                    href="${dashboardUrl}"
                    style="
                      display:inline-block;
                      background:${brandColor};
                      color:#ffffff;
                      text-decoration:none;
                      font-weight:700;
                      font-size:15px;
                      padding:14px 22px;
                      border-radius:12px;
                    "
                  >
                    View in Dashboard
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      `,
    });

    console.log("EMAIL RESULT:", emailResult);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Route crash:", error);
    return NextResponse.json({ error: "Server crashed" }, { status: 500 });
  }
}