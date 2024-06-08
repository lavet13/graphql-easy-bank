import gql from 'graphql-tag';

export default gql`
  type Query {
    financialHistory(input: FinansInput!): FinansResponse!
    currentBalance: Float!
  }

  input FinansInput {
    take: Int
    after: Int
    before: Int
  }

  type FinansResponse {
    edges: [Finance!]!
    pageInfo: PageInfo!
  }

  type Finance {
    id: ID!
    user: User!
    income: Float!
    expenses: Float!
    creditScore: Int!
    currentBalance: Float!
    createdAt: Date!
    updatedAt: Date!
  }
`;
