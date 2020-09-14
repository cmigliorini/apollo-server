const { ApolloServer } = require('apollo-server-azure-functions');

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
  },
  Mutation: {
    login: async (_, {email}, { dataSources }) => {
      const user = await dataSources.userAPI.findOrCreateUser(email);
      return user;
    }
  }
};

const server = new ApolloServer({
  typeDefs, resolvers, dataSources: () => ({
    //languagesAPI: new LanguagesAPI({store}),
    userAPI: new UserAPI({ store })
  })
});

exports.graphqlHandler = server.createHandler();

