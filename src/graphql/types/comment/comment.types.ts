import gql from 'graphql-tag';

export default gql`
  type Comment {
    id: ID!
    text: String!
    user: User!
    loan: Loan!
    createdAt: Date!
    updatedAt: Date!
  }
`;
