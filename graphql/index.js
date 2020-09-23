const { ApolloServer } = require('apollo-server-azure-functions');
const isEmail = require('isemail');

const UserAPI = require('./datasources/userapi');
const LanguageAPI = require('./datasources/languageapi');
const { createStore } = require('./utils');
const typeDefs = require('./schema');

// creates a sequelize connection once. NOT for every request
const store = createStore();


// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    me: async (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser(),
    language: async (_, {languageId}, { dataSources}) =>
      dataSources.userAPI.getLanguageById({ languageId }),
    allLanguages: async (_, __, { dataSources }) => 
      await store.languages.findAll(),
    allLanguageTypes: async (_, __, { dataSources }) =>
      await store.languageTypes.findAll(),
    languageTypesLanguages: async (_, __, { dataSources }) =>
      await store.languageTypesLanguage.findAll(),
    userLanguages: async (_, __, { dataSources }) =>
      await store.userLanguages.findAll(),
    getLanguageIdsByUser: async (_, __, { dataSources }) =>
      await dataSources.userAPI.getLanguageIdsByUser(),
  },
  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser({ email });
      if (user) {
        user.token = new Buffer.from(email).toString('base64');
        return user;
      }
    },
    acquireLanguage: async (_, { languageId }, { dataSources }) => {
      return await dataSources.userAPI.acquireLanguage({ languageId });
    },
    acquireLanguages: async (_, { languageIds }, { dataSources }) => {
      const results = await dataSources.userAPI.acquireLanguages({ languageIds });
      
      const languages = await dataSources.userAPI.getLanguagesByIds({
        languageIds,
      });

      return {
        success: results && results.length === languageIds.length,
        message:
          results.length === languageIds.length
            ? 'languages acquired successfully'
            : `the following languages couldn't be acquired: ${languageIds.filter(
                id => !results.includes(id),
              )}`,
          languages,
      };
    },
    forgetLanguage: async (_, { languageId }, { dataSources }) => {
      const result = await dataSources.userAPI.forgetLanguage({ languageId });
      
      if (!result)
        return {
          success: false,
          message: 'failed to forget language',
        };

      const language = await dataSources.userAPI.getLanguageById({ languageId });
      return {
        success: true,
        message: 'language forgotten',
        languages: [language],
      };

    },
    // TODO:  migrate this to LanguageApi
    insertLanguage: async (_, { name, description }, { dataSources }) => {
      return await dataSources.userAPI.insertLanguage({ name:name, description:description });
    },
    // TODO:  migrate this to LanguageTypesApi
    insertLanguageType: async (_, { name, description }, { dataSources }) => {
      return await dataSources.userAPI.insertLanguageType({ name, description });
    },
    // TODO:  migrate this to LanguageApi
    associateLanguageToType: async (_, {languageId, languageTypeId}, {dataSources}) => 
      await dataSources.userAPI.associateLanguageToType({ languageId, languageTypeId }),
    // TODO:  migrate this to LanguageApi
    dissociateLanguageFromType: async (_, {languageId, languageTypeId}, {dataSources}) => 
      await dataSources.userAPI.dissociateLanguageFromType({ languageId, languageTypeId }),
  },
  User: {
    languages: async (_, __, { dataSources }) => {
      // get ids of languages by user
      const languageIds = await dataSources.userAPI.getLanguageIdsByUser();

      if (!languageIds.length) return [];

      // look up those languages by their ids
      return (
        dataSources.userAPI.getLanguagesByIds({
          languageIds
        }) || []
      );
    },
  },
  // Language-context resolves
  Language: {
    // Is this language acquired by current user?
    isAcquired: async (language, __, { dataSources }) =>
      dataSources.userAPI.isAcquired({ languageId: language.id }),
    // What are this language's LanguageTypes?
    languageTypes: async (language, __, { dataSources }) => {
      // get ids of language types by language
      const languageTypeIds = await dataSources.languageAPI.getLanguageTypesIdsByLanguage({ languageId: language.id});
      if (!languageTypeIds.length) return [];
      // look up those languages by their ids
      return dataSources.languageAPI.getLanguagesTypesByIds({ languageTypeIds }) || [];
    },
  },
};
// the function that sets up the global context for each resolver, using the req
const context = async (integrationContext) => {
  // simple auth check on every request (Azure Functions flavour)
  const auth = (integrationContext.context.req.headers && integrationContext.context.req.headers.authorization) || '';
  const email = new Buffer.from(auth, 'base64').toString('ascii');

  // if the email isn't formatted validly, return null for user
  if (!isEmail.validate(email)) return { user: null };
  // find a user by their email
  const users = await store.users.findOrCreate({ where: { email } });
  const user = users && users[0] ? users[0] : null;

  return { user };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  introspection: true,
  playground: true,
  dataSources: () => ({
    languageAPI: new LanguageAPI({store}),
    userAPI: new UserAPI({ store })
  })
});

exports.graphqlHandler = server.createHandler({
  cors: false
});
