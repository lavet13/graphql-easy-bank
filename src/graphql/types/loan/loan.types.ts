import gql from 'graphql-tag';

export default gql`
  type Query {
    loans(input: LoansInput!): LoansResponse!
    loanById(id: ID!): Loan!
  }

  type Mutation {
    createLoan(input: CreateLoanInput!): Loan!
    updateLoan(input: UpdateLoanInput!): Loan!
    delLoan(id: ID!): Boolean!
  }

  input CreateLoanInput {
    term: Int!
    amount: Float!
  }

  input UpdateLoanInput {
    id: ID!
    term: Int!
    amount: Float!
    status: LoanStatus!
    text: String!
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
    user: User
    status: LoanStatus!
    comment: Comment
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
