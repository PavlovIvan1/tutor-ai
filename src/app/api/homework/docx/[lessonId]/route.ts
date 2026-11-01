import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { markdownToDocx } from "@/lib/mdDocx/build";

export const runtime = "nodejs";
export const maxDuration = 120;

type Row = { homework_md: string; created_at: string };

export async function GET(_req: NextRequest, ctx: { params: { lessonId: string } }) {
  const row = getDb()
    .prepare("SELECT homework_md, created_at FROM lessons WHERE id = ?")
    .get(Number(ctx.params.lessonId)) as Row | undefined;
  if (!row || !row.homework_md) return NextResponse.json({ error: "ДЗ не найдено" }, { status: 404 });

  const buffer = await markdownToDocx(row.homework_md);
  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="homework-${ctx.params.lessonId}.docx"`,
    },
  });
}
