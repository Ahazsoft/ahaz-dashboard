import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, context: any) {
  try {
    // context.params may be a Promise (Next.js types) or an object. Resolve either.
    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const parsed = Number(id);
    const where = !isNaN(parsed) ? { id: parsed } : { id };

    const job = await prisma.jobs.findUnique({ where } as any);
    if (!job) return NextResponse.json({ job: null }, { status: 404 });

    const mapped = {
      id: job.id,
      company: job.company,
      title: job.title,
      jobType: job.job_type ?? job.jobType,
      jobLevel: job.job_level ?? job.jobLevel,
      location: job.location,
      salary: job.salary,
      description: job.description,
      education: job.education,
      email: job.email,
      postDate: job.post_date ? new Date(job.post_date).toISOString() : null,
      expiryDate: job.expiry_date ? new Date(job.expiry_date).toISOString() : null,
      status: job.status ?? "open",
      applicants: job.applicants ?? [],
    };

    return NextResponse.json({ job: mapped }, { status: 200 });
  } catch (err: any) {
    console.error("/api/jobs/read/[id] error", err);
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 });
  }
}
