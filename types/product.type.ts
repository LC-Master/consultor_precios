export type IProduct = null | {
  isBlocked: boolean;
  barCode: number;
  articleCode: number;
  description: string;
  prices: {
    base: number;
    tax: number;
    priceWithTax: number;
    referencePrice: number;
  };
  promotion: null | {
    name: string;
    basePrice: number;
    priceWithTax: number;
    referencePrice: number;
    discountPercentage: number;
    savings: number;
  };
  rate: {
    dollar?: number;
    euro?: number;
  };
};
