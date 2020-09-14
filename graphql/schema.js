const { gql } = require('apollo-server-azure-functions');

const typeDefs = gql`
  type User {
      id: Int!
    email: String!,
    token: String,
    profileImage: String
  }
  type Query {
    me: User
  }
  type Mutation {
    login(email: String): User
  }
`;

module.exports = typeDefs;
