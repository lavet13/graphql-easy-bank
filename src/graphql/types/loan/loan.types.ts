import gql from 'graphql-tag';

export default gql`
  type Query {
    loans(input: LoansInput!): LoansResponse!
  }

  input LoansInput {
    take: Int
    after: Int
    before: Int
  }

  type PageInfo {
    startCursor: Int
    endCursor: Int
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type LoansResponse {
    edges: [Loan!]!
    pageInfo: PageInfo!
  }

  type Loan {
    id: ID!
    amount: Float!
    term: Int!
    interestRate: Float!
    user: User!
    status: LoanStatus!
    comments: [Comment!]!
    calculation: LoanCalculation
    createdAt: Date!
    updatedAt: Date!
  }

  type LoanCalculation {
    id: ID!
    totalPayment: Float!
    loan: Loan!
    createdAt: Date!
  }

  enum LoanStatus {
    PENDING
    APPROVED
    REJECTED
    ACTIVE
    PAID
    DEFAULTED
  }
`;
