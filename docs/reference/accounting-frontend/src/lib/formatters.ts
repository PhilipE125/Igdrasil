/** Format an amount for display with optional currency suffix. */
export function formatAmount(amount: number | undefined | null, currency?: string): string {
  if (amount == null) return "-";
  const formatted = amount.toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency && currency !== "SEK" ? `${formatted} ${currency}` : `${formatted} kr`;
}
