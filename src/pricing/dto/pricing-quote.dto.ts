export class PricingQuoteDto {
  productId: string;
  quantity?: number; // default 1

  // seleções do usuário
  selections: {
    groupCode: string;   // ex: "SIZE", "CUT_STYLE"
    optionId: string;    // id da AttributeOption
  }[];
}