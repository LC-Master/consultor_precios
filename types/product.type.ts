export type Product = null | {
  isBlocked: boolean;
  barCode: number;
  articleCode: number;
  description: string;
  prices: {
    base: number;
    tax: number;
    taxAmount?: number | null;
    priceWithTax: number;
    referencePrice: number;
  };
  promotion: {
    name: string | null | undefined;
    basePrice: number | null | undefined;
    taxAmount?: number | null;
    priceWithTax: number | null | undefined;
    referencePrice: number | null | undefined;
    discountPercentage: number | null | undefined;
    savings: number | null | undefined;
  } | null;
  rate: {
    dollar?: number;
    euro?: number;
  };
};
