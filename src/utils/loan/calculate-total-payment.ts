export function calculateTotalPayment(
  loanAmount: number,
  interestRate: number,
  term: number,
): number {
  const interest = loanAmount * interestRate * term;
  const totalPayment = loanAmount + interest;

  return totalPayment;
}
