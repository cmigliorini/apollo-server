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
    languageTypes: [LanguageType],
    userLanguages: [UserLanguage],
    getLanguageIdsByUser: [Int],
    isAcquired(languageId: Int!): Boolean,
    languageTypesLanguages: [LanguageTypeLanguage]
  }
  type Mutation {
    login(email: String): User,
    acquireLanguage(languageId:Int!): UserLanguage,
    acquireLanguages(languageIds:[Int!]): [UserLanguage],
    forgetLanguage(languageId:Int!): Boolean,
    insertLanguage(name:String, description:String): Language,
    insertLanguageType(name:String, description:String): LanguageType,
    associateLanguageToType(languageId: Int!, languageTypeId: Int!): LanguageTypeLanguage,
  }
`;

module.exports = typeDefs;
