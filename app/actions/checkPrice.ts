"use server";

import { XMLParser } from "fast-xml-parser";
import { ActionCheckPriceErrors } from "../Errors/ActionCheckPriceErrors";
import { IProduct } from "@/types/product.type";
import { checkPricesSchema } from "../schemas/checkPriceSchema";

const ENDPOINT_URL = process.env.URL_CONSULTA_PRECIO;

export async function checkPrice(barCode: string): Promise<IProduct | null> {
  const validatedFields = checkPricesSchema.safeParse({
    code: barCode,
  });

  if (!validatedFields.success) {
    throw new Error(ActionCheckPriceErrors.INVALID_BARCODE);
  }

  const response = await fetch(ENDPOINT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `CodigoBarra=${barCode}`,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("SOAP ERROR:", text);
    throw new Error(ActionCheckPriceErrors.PRODUCT_NOT_FOUND);
  }

  const xml = await response.text();

  const parser = new XMLParser();
  const data = parser.parse(xml);

  const table = data?.DataSet?.["diffgr:diffgram"]?.NewDataSet?.Table;

  if (!table) {
    throw new Error(ActionCheckPriceErrors.PRODUCT_NOT_FOUND);
  }

  const isProductEmpty =
    (table.CodBarra === "" || table.CodBarra == null) &&
    (table.CodArticulo === "" || table.CodArticulo == null);

  const isPromotionEmpty =
    (table.NomProm === "" || table.NomProm == null) &&
    table.PrecioBaseProm === 0 &&
    table.PrecioIVAProm === 0 &&
    table.PrecioRefProm === 0 &&
    table.PorcDesc === 0;

  const result = isProductEmpty
    ? null
    : {
        isBlocked: table.Bloqueado,
        barCode: table.CodBarra,
        articleCode: table.CodArticulo,
        description: table.Descripcion,
        prices: {
          base: table.PrecioBase,
          tax: table.Iva,
          priceWithTax: table.PrecioIva,
          referencePrice: table.PrecioRef,
        },
        promotion: isPromotionEmpty
          ? null
          : {
              name: table.NomProm,
              basePrice: table.PrecioBaseProm,
              priceWithTax: table.PrecioIVAProm,
              referencePrice: table.PrecioRefProm,
              savings: table.PrecioIva - table.PrecioIVAProm,
              discountPercentage: table.PorcDesc,
            },
        rate: {
          dollar: table.Tasa,
          euro: table.TasaEuro,
        },
      };

  return result;
}
