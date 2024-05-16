import gql from 'graphql-tag';

export default gql`
  scalar Date

  type Query {
    foods: [Food!]!
  }

  type Food {
    id: ID!
    name: String!
  }
`;
