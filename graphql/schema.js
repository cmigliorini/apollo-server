const { gql } = require('apollo-server-azure-functions');

const typeDefs = gql`
  type User {
    id: Int!
    email: String!,
    token: String,
    profileImage: String
  }
  type Language {
    id: Int!
    name: String!,
    description: String,
  }
  type LanguageType {
    id: Int!
    name: String!,
    description: String,
  }
  type LanguageTypeLanguage {
    languageId: Int!,
    languageTypeId: Int!,
  }
  type UserLanguage {
    languageId: Int!,
    userId: Int!,
  }
  type Query {
    me: User
  }
  type Mutation {
    login(email: String): User
  }
`;

module.exports = typeDefs;
