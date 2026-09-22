export interface MarginCalculation {
  sellingPrice: number;
  purchaseCost: number;
  otherCostPercent: number;
  otherCostAmount: number;
  grossMarginAmount: number;
  grossMarginPercent: number;
  netMarginAmount: number;
  netMarginPercent: number;
  isPositive: boolean;
  alertLevel: "HEALTHY" | "MODERATE" | "CRITICAL";
}

/**
 * Calculates Gross and Net margin according to PRD business logic:
 * Selling Price - Purchase Cost - Other Costs = Net Margin
 */
export function calculateMargin(
  sellingPrice: number,
  purchaseCost: number,
  otherCostPercent: number = 3 // default 3% for packaging, gateway & logistics
): MarginCalculation {
  const safeSellingPrice = Math.max(0, sellingPrice);
  const safePurchaseCost = Math.max(0, purchaseCost);
  
  const otherCostAmount = Math.round((safeSellingPrice * otherCostPercent) / 100);
  const grossMarginAmount = safeSellingPrice - safePurchaseCost;
  const netMarginAmount = grossMarginAmount - otherCostAmount;
  
  const grossMarginPercent =
    safeSellingPrice > 0 ? (grossMarginAmount / safeSellingPrice) * 100 : 0;
  const netMarginPercent =
    safeSellingPrice > 0 ? (netMarginAmount / safeSellingPrice) * 100 : 0;

  let alertLevel: "HEALTHY" | "MODERATE" | "CRITICAL" = "HEALTHY";
  if (netMarginPercent < 5) {
    alertLevel = "CRITICAL";
  } else if (netMarginPercent < 12) {
    alertLevel = "MODERATE";
  }

  return {
    sellingPrice: safeSellingPrice,
    purchaseCost: safePurchaseCost,
    otherCostPercent,
    otherCostAmount,
    grossMarginAmount,
    grossMarginPercent: Number(grossMarginPercent.toFixed(2)),
    netMarginAmount,
    netMarginPercent: Number(netMarginPercent.toFixed(2)),
    isPositive: netMarginAmount > 0,
    alertLevel,
  };
}
