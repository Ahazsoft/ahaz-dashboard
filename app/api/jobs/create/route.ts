import { NextResponse } from 'next/server';
import * as z from 'zod';
import prisma from '@/lib/prisma';

const jobSchema = z.object({
  company: z.string().optional(),
  title: z.string(),
  jobType: z.string(),
  jobLevel: z.string(),
  location: z.string(),
  salary: z.string(),
  description: z.string(),
  education: z.string(),
  email: z.string().email(),
  postDate: z.string().optional(),
  expiryDate: z.string(),
  status: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = jobSchema.parse(body);

    // Create record in Prisma. Adjust model name/fields if your schema differs.
    // Map camelCase request fields to Prisma model column names (snake_case)
    const created = await prisma.jobs.create({
      data: {
        company: data.company ?? 'Ahaz Solutions',
        title: data.title,
        job_type: data.jobType,
        job_level: data.jobLevel,
        location: data.location,
        salary: data.salary,
        description: data.description,
        education: data.education,
        email: data.email,
        post_date: data.postDate ?? new Date().toISOString(),
        expiry_date: data.expiryDate,
        status: data.status ?? 'open',
      },
    });

    return NextResponse.json({ success: true, job: created }, { status: 201 });
  } catch (err: any) {
    console.error('/api/jobs error', err);
    if (err?.issues) return NextResponse.json({ error: 'validation', details: err.issues }, { status: 422 });
    return NextResponse.json({ error: err?.message ?? 'unknown' }, { status: 500 });
  }
}
