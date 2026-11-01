import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import { parseMarkdown, splitByImagePrompts, type MdBlock } from "@/lib/mdDocx/parse";
import { fetchTaskImage } from "@/lib/mdDocx/image";

/** Markdown -> .docx. Изображения для Part 3 подгружаются по IMAGE_PROMPT. */
export async function markdownToDocx(md: string): Promise<Buffer> {
  const sections = await renderBlocks(md);
  const doc = new Document({ sections: [{ children: sections }] });
  return Buffer.from(await Packer.toBuffer(doc));
}

const H = { h1: HeadingLevel.HEADING_1, h2: HeadingLevel.HEADING_2, h3: HeadingLevel.HEADING_3 };

async function renderBlocks(md: string): Promise<Paragraph[]> {
  const out: Paragraph[] = [];
  for (const chunk of splitByImagePrompts(md)) {
    if (chunk.image) {
      const img = await fetchTaskImage(chunk.image);
      if (img) {
        out.push(new Paragraph({ spacing: { before: 200 }, children: [new ImageRun({
          data: img.props.data,
          transformation: img.props.transformation,
          type: "png",
        })] }));
        out.push(captionPar(chunk.image));
      } else {
        out.push(captionPar(`[AI_IMAGE: ${chunk.image}]`));
      }
    }
    for (const block of parseMarkdown(chunk.text)) out.push(toParagraph(block));
  }
  return out;
}

function captionPar(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, italics: true, size: 20, color: "666666" })],
  });
}

function toParagraph(b: MdBlock): Paragraph {
  if (b.kind !== "bullet" && b.kind !== "para") {
    return new Paragraph({ text: b.text, heading: H[b.kind], spacing: { before: 240, after: 120 } });
  }
  const runs = b.parts.map((p) => new TextRun({ text: p.text, bold: p.bold, size: 22, font: "Calibri" }));
  if (b.kind === "bullet") {
    return new Paragraph({ children: runs, bullet: { level: 0 } });
  }
  return new Paragraph({ children: runs, alignment: AlignmentType.LEFT, spacing: { after: 120 } });
}
