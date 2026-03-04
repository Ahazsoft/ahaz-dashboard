import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, context: any) {
  try {
    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const parsed = Number(id);
    const where = !isNaN(parsed) ? { id: parsed } : { id };

    const body = await req.json();

    const data: any = {};
    if (body.title !== undefined) data.title = body.title;
    if (body.company !== undefined) data.company = body.company;
    if (body.jobType !== undefined) data.job_type = body.jobType;
    if (body.jobLevel !== undefined) data.job_level = body.jobLevel;
    if (body.location !== undefined) data.location = body.location;
    if (body.salary !== undefined) data.salary = body.salary;
    if (body.description !== undefined) data.description = body.description;
    if (body.education !== undefined) data.education = body.education;
    if (body.email !== undefined) data.email = body.email;
    if (body.postDate !== undefined) data.post_date = body.postDate;
    if (body.expiryDate !== undefined) data.expiry_date = body.expiryDate;
    if (body.status !== undefined) data.status = body.status;

    const updated = await prisma.jobs.update({ where: where as any, data });

    return NextResponse.json({ job: updated }, { status: 200 });
  } catch (err: any) {
    console.error("/api/jobs/update/[id] error", err);
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 });
  }
}
