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
    isAcquired: Boolean!,
    languageTypes: [LanguageType!]
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
  type LanguageUpdateResponse {
    success: Boolean!
    message: String
    languages: [Language]
  }

  type Query {
    me: User,
    language(languageId: ID!): Language,
    allLanguages: [Language],
    allLanguageTypes: [LanguageType],
    getLanguageTypeIdsByLanguage(languageId: ID!): [LanguageType!],
    userLanguages: [UserLanguage],
    getLanguageIdsByUser: [ID],
    isAcquired(languageId: ID!): Boolean,
    languageTypesLanguages: [LanguageTypeLanguage]
  }
  type Mutation {
    login(email: String): User!,
    acquireLanguage(languageId:ID!): UserLanguage,
    acquireLanguages(languageIds:[ID!]): LanguageUpdateResponse,
    forgetLanguage(languageId:ID!): LanguageUpdateResponse,
    insertLanguage(name:String, description:String): Language,
    insertLanguageType(name:String, description:String): LanguageType,
    associateLanguageToType(languageId: ID!, languageTypeId: ID!): LanguageTypeLanguage,
  }
`;

module.exports = typeDefs;
