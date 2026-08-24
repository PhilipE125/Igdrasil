import { readFile } from "node:fs/promises";
import path from "node:path";

/** Prose pages that live as markdown under `content/pages/`. */
export type DocSlug = "about" | "why-igdrasil";

export async function readDoc(slug: DocSlug) {
  return readFile(path.join(process.cwd(), "content", "pages", `${slug}.md`), "utf8");
}

/** Markdown emphasis and links, reduced to the text a crawler should read. */
function toPlainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export type FaqEntry = { question: string; answer: string };

/**
 * Pulls the `### question` / answer pairs out of a document's FAQ section so a
 * page can publish them as FAQPage structured data instead of restating them
 * in TypeScript. Returns an empty list for documents without an FAQ.
 */
export function extractFaq(markdown: string): FaqEntry[] {
  const afterHeading = markdown.split(/^## Frequently asked questions.*$/m)[1];
  if (!afterHeading) return [];

  const section = afterHeading.split(/^## /m)[0];

  return [...section.matchAll(/^### (.+)\n+([\s\S]*?)(?=\n### |\n---|$)/gm)].map(
    ([, question, answer]) => ({
      question: toPlainText(question),
      answer: toPlainText(answer),
    }),
  );
}
