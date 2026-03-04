import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const jobs = await prisma.jobs.findMany({ orderBy: { post_date: "desc" } });

    const mapped = jobs.map((j: any) => ({
      id: j.id,
      company: j.company,
      title: j.title,
      jobType: j.job_type ?? j.jobType,
      jobLevel: j.job_level ?? j.jobLevel,
      location: j.location,
      salary: j.salary,
      description: j.description,
      education: j.education,
      email: j.email,
      postDate: j.post_date ? new Date(j.post_date).toISOString() : null,
      expiryDate: j.expiry_date ? new Date(j.expiry_date).toISOString() : null,
      status: j.status ?? "open",
      applicants: j.applicants ?? [],
    }));

    return NextResponse.json({ jobs: mapped }, { status: 200 });
  } catch (err: any) {
    console.error("/api/jobs/read error", err);
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 });
  }
}
