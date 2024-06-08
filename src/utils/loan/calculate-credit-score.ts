import { FinancialHistory } from '@prisma/client';

export function calculateCreditScore(financialHistory: FinancialHistory[], term: number): number {
  // Implement the logic to calculate the credit score based on the financial history
  // This is a simplified example, in practice, you would likely consider more factors
  const paymentHistory = financialHistory.map(record => ({
    amount: record.income,
    term,
    paidOnTime: isPaidOnTime(record, term),
  }));

  // Check if there are any payment records
  if (paymentHistory.length === 0) {
    // If there are no payment records, return a default credit score
    return 700; // or any other default value you prefer
  }

  // Calculate the credit score based on the payment history
  // For example, calculate the percentage of on-time payments
  const totalPayments = paymentHistory.length;
  const onTimePayments = paymentHistory.filter(record => record.paidOnTime).length;
  const onTimePaymentRatio = onTimePayments / totalPayments;

  // Calculate the credit score based on the on-time payment ratio
  const creditScore = Math.round(onTimePaymentRatio * 850); // Assume a maximum credit score of 850

  return creditScore;
}

function isPaidOnTime(record: FinancialHistory, term: number): boolean {
  // Calculate the expected due date based on the loan term
  const expectedDueDate = record.createdAt.getTime() + term * 30 * 24 * 60 * 60 * 1000;

  // Check if the updatedAt date is before or on the expected due date
  const isPaidOnTime = record.updatedAt.getTime() <= expectedDueDate;

  return isPaidOnTime;
}
