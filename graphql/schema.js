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
    languageTypeId: Int!
  }
  type UserLanguage {
    languageId: Int!,
    userId: Int!
  }
  type Query {
    me: User,
    languages: [Language],
    languageTypes: [LanguageType]
  }
  type Mutation {
    login(email: String): User,
    acquireLanguage(languageId:Int!): UserLanguage,
  }
`;

module.exports = typeDefs;
