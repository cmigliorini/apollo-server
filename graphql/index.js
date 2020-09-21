const { ApolloServer } = require('apollo-server-azure-functions');
const isEmail = require('isemail');

const UserAPI = require('./datasources/userapi');
const { createStore } = require('./utils');
const typeDefs = require('./schema');

// creates a sequelize connection once. NOT for every request
const store = createStore();


// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    me: async (_, __, { dataSources }) =>
      dataSources.userAPI.findOrCreateUser(),
    allLanguages: async (_, __, { dataSources }) => 
      await store.languages.findAll(),
    languageTypes: async (_, __, { dataSources }) =>
      await store.languageTypes.findAll(),
    languageTypesLanguages: async (_, __, { dataSources }) =>
      await store.languageTypesLanguage.findAll(),
    // TODO: create UserLanguagesApi
    userLanguages: async (_, __, { dataSources }) =>
      await store.userLanguages.findAll(),
    getLanguageIdsByUser: async (_, __, { dataSources }) =>
      await dataSources.userAPI.getLanguageIdsByUser(),
  },
  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser(email);
      return user;
    },
    acquireLanguage: async (_, { languageId }, { dataSources }) => {
      return await dataSources.userAPI.acquireLanguage({ languageId });
    },
    acquireLanguages: async (_, { languageIds }, { dataSources }) => {
      return await dataSources.userAPI.acquireLanguages({ languageIds });
    },
    forgetLanguage: async (_, { languageId }, { dataSources }) => {
      return await dataSources.userAPI.forgetLanguage({ languageId });
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
    }
  }
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
    //kanguagesAPI: new LanguagesAPI({store}),
    userAPI: new UserAPI({ store })
  })
});

exports.graphqlHandler = server.createHandler();
