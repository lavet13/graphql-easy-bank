import gql from 'graphql-tag';

export default gql`
  type Query {
    me: User
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
  }

  enum Role {
    USER
    ADMIN
  }
`;
