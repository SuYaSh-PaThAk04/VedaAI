import { createRequire } from "node:module";
import type { Express } from "express";

const MAX_SOURCE_CHARS = 12_000;

type PdfParseResult = {
  text: string;
};

type PdfParseFn = (buffer: Buffer) => Promise<PdfParseResult>;

const require = createRequire(import.meta.url);

let pdfParseFn: PdfParseFn | null = null;

function getPdfParse(): PdfParseFn {
  if (!pdfParseFn) {
    pdfParseFn = require("pdf-parse") as PdfParseFn;
  }
  return pdfParseFn;
}

function normalizeExtractedText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await getPdfParse()(buffer);
  return normalizeExtractedText(result.text ?? "");
}

export async function readUploadedSource(file?: Express.Multer.File) {
  if (!file) {
    return "";
  }

  const name = file.originalname.toLowerCase();

  if (file.mimetype === "text/plain" || name.endsWith(".txt")) {
    return file.buffer.toString("utf8").slice(0, MAX_SOURCE_CHARS);
  }

  if (file.mimetype === "application/pdf" || name.endsWith(".pdf")) {
    try {
      const text = await extractPdfText(file.buffer);
      if (!text) {
        return "";
      }
      return text.slice(0, MAX_SOURCE_CHARS);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown PDF parse error";
      return `PDF uploaded (${file.originalname}) but text could not be extracted: ${message}`;
    }
  }

  return "";
}
