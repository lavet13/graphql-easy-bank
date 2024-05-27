import gql from 'graphql-tag';

export default gql`
  type Query {
    me: User
  }

  input LoginInput {
    login: String!
    password: String!
  }

  input SignupInput {
    email: String!
    name: String!
    password: String!
  }

  type Mutation {
    login(loginInput: LoginInput!): AuthPayload!
    signup(signupInput: SignupInput!): AuthPayload!
  }

  type AuthPayload {
    token: String!
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
