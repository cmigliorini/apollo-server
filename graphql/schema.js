const { gql } = require('apollo-server-azure-functions');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!,
    token: String,
    profileImage: String
    languages: [Language],
  }
  type Language {
    id: ID!
    name: String!,
    description: String,
  }
  type LanguageType {
    id: ID!
    name: String!,
    description: String,
  }
  type LanguageTypeLanguage {
    languageId: ID!,
    languageTypeId: ID!
  }
  type UserLanguage {
    languageId: ID!,
    userId: ID!
  }
  type Query {
    me: User,
    allLanguages: [Language],
    languageTypes: [LanguageType],
    userLanguages: [UserLanguage],
    getLanguageIdsByUser: [ID],
    isAcquired(languageId: ID!): Boolean,
    languageTypesLanguages: [LanguageTypeLanguage]
  }
  type Mutation {
    login(email: String): User!,
    acquireLanguage(languageId:ID!): UserLanguage,
    acquireLanguages(languageIds:[ID!]): [UserLanguage],
    forgetLanguage(languageId:Int!): Boolean,
    insertLanguage(name:String, description:String): Language,
    insertLanguageType(name:String, description:String): LanguageType,
    associateLanguageToType(languageId: ID!, languageTypeId: ID!): LanguageTypeLanguage,
  }
`;

module.exports = typeDefs;
