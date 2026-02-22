export function formatCurrency(quantity: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    currencyDisplay: "symbol",
  }).format(quantity);
}

export function formatDate(isoString: string) {
  const date = new Date(isoString);

  const formatter = new Intl.DateTimeFormat("es-CL", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return formatter.format(date);
}
