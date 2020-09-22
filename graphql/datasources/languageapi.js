const { DataSource } = require('apollo-datasource');

class LanguageAPI extends DataSource {
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
  async getLanguageTypesIdsByLanguage({ languageId }) {
    const found = await this.store.languageTypesLanguage.findAll({
      where: { languageId: languageId },
    });
    return found && found.length
      ? found.map(l => l.dataValues.languageTypeId).filter(l => !!l)
      : [];
  }

  async getLanguageTypeById({ languageTypeId }) {
    const res = await this.store.languageTypes.findOne({ where: { id: languageTypeId } });
    return res;
  }

  async getLanguagesTypesByIds({ languageTypeIds }) {
    if (languageTypeIds && languageTypeIds.length) {
      return Promise.all(
        languageTypeIds.map(languageTypeId => this.getLanguageTypeById({ languageTypeId })),
      );
    }
    else {
      return [];
    }
  }
}

module.exports = LanguageAPI;