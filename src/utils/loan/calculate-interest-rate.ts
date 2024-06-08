export function calculateInterestRate(creditScore: number, loanAmount: number, loanTerm: number): number {
  // Implement the logic to calculate the interest rate based on the provided factors
  // This is a simplified example, in practice, you might consider more complex calculations
  let baseInterestRate = 0.05; // Assume a base interest rate of 5%

  // Adjust the interest rate based on credit score
  if (creditScore < 600) {
    baseInterestRate += 0.03; // Add 3% for lower credit scores
  } else if (creditScore >= 600 && creditScore < 700) {
    baseInterestRate += 0.02; // Add 2% for average credit scores
  }

  // Adjust the interest rate based on loan amount
  if (loanAmount > 100000) {
    baseInterestRate -= 0.01; // Reduce interest rate for larger loan amounts
  }

  // Adjust the interest rate based on loan term
  if (loanTerm > 60) {
    baseInterestRate += 0.01; // Increase interest rate for longer loan terms
  }

  return baseInterestRate;
}
