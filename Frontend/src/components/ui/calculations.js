export function calcLoan(amount, rate, months) {
  const principal = Number(amount || 0);
  const annualRate = Number(rate || 0);
  const duration = Math.max(1, Number(months || 1));
  const interest = principal * (annualRate / 100) * (duration / 12);
  const total = principal + interest;
  return {
    interest,
    total,
    monthly: total / duration,
  };
}
