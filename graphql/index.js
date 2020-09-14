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
    languages: async (_, __, { dataSources }) =>
      await store.languages.findAll(),
    languageTypes: async (_, __, { dataSources }) =>
      await store.languageTypes.findAll(),
  },
  Mutation: {
    login: async (_, { email }, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser(email);
      return user;
    },
    acquireLanguage: async (_, { languageId }, { dataSources }) => {
      return await dataSources.userAPI.acquireLanguage({ languageId });
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
