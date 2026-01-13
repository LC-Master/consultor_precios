"use server";

import isRateLimited from "@/lib/rateLimit";
import { XMLParser } from "fast-xml-parser";
import { headers } from "next/headers"; 
const ENDPOINT_URL = process.env.URL_CONSULTA_PRECIO;

export async function consultarArticulo(codigoBarra: string) {
  if (!codigoBarra) return null;

  const headerList = headers();
  const ip = (await headerList).get("x-forwarded-for") || "local-zebra";

  if (isRateLimited(ip, 5, 10000)) {
    console.warn(`Rate limit activado para IP: ${ip}`);
    throw new Error("⚠️ Demasiadas consultas. Por favor, espera un momento.");
  }

  const response = await fetch(ENDPOINT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `CodigoBarra=${codigoBarra}`,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("SOAP ERROR:", text);
    throw new Error("Error consultando artículo");
  }

  const xml = await response.text();

  const parser = new XMLParser();
  const data = parser.parse(xml);

  return data?.DataSet?.["diffgr:diffgram"]?.NewDataSet?.Table ?? null;
}
