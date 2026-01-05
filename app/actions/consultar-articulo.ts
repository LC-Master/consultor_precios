'use server'

import { XMLParser } from "fast-xml-parser";

const ENDPOINT_URL = process.env.URL_CONSULTA_PRECIO

export async function consultarArticulo(codigoBarra: string) {
  if (!codigoBarra) return null;

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

  return (
    data?.DataSet?.["diffgr:diffgram"]?.NewDataSet?.Table ?? null
  );
}
