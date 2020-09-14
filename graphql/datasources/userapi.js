const { DataSource } = require('apollo-datasource');
const isEmail = require('isemail');

class UserAPI extends DataSource {
  constructor({ store }) {
    super();
    this.store = store;
  }


  /**
   * This is a function that gets called by ApolloServer when being setup.
   * This function gets called with the datasource config including things
   * like caches and context. We'll assign this.context to the request context
   * here, so we can know about the user making requests
   */
  initialize(config) {
    this.context = config.context;
  }

  /**
   * User can be called with an argument that includes email, but it doesn't
   * have to be. If the user is already on the context, it will use that user
   * instead
   */
  async findOrCreateUser(emailArg = null) {
    const email =
      this.context && this.context.user ? this.context.user.email : emailArg;
    if (!email || !isEmail.validate(email)) return null;

    let user = await this.store.users.findOne({ where: { email } });

    if (!user) {
      user = await this.store.users.create({ email: email ,token : new Buffer.from(email).toString('base64')});
    }
    return user;
  }

  async acquireLanguages({ languageIds }) {
    const userId = this.context.user.id;
    if (!userId) return;

    let results = [];

    // for each launch id, try to book the trip and add it to the results array
    // if successful
    for (const languageId of languageIds) {
      const res = await this.acquireLanguage({ languageId: languageId });
      if (res) results.push(res);
    }

    return results;
  }

  async acquireLanguage({ languageId }) {
    const userId = this.context.user.id;
    const res = await this.store.userLanguages.findOrCreate({
      where: { userId, languageId },
    });
    return res && res.length ? res[0].get() : false;
  }

  async forgetLanguage({ languageId }) {
    const userId = this.context.user.id;
    return !!this.store.userLanguages.destroy({ where: { userId, languageId } });
  }

  async getLanguageIdsByUser() {
    const userId = this.context.user.id;
    const found = await this.store.userLanguages.findAll({
      where: { userId },
    });
    return found && found.length
      ? found.map(l => l.dataValues.languageId).filter(l => !!l)
      : [];
  }

  async isAcquired({ languageId }) {
    if (!this.context || !this.context.user) return false;
    const userId = this.context.user.id;
    const found = await this.store.userLanguages.findAll({
      where: { userId, languageId },
    });
    return found && found.length > 0;
  }
}

module.exports = UserAPI;