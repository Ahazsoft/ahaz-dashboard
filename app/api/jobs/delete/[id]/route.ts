import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req: Request, context: any) {
  try {
    const params = context?.params ? await context.params : {};
    const id = params?.id;
    const parsed = Number(id);
    const where = !isNaN(parsed) ? { id: parsed } : { id };

    const deleted = await prisma.jobs.delete({ where: where as any });
    return NextResponse.json({ success: true, job: deleted }, { status: 200 });
  } catch (err: any) {
    console.error("/api/jobs/delete/[id] error", err);
    return NextResponse.json({ error: err?.message ?? "unknown" }, { status: 500 });
  }
}
