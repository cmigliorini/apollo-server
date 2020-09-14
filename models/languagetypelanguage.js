'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LanguageTypeLanguage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LanguageTypeLanguage.init({
    languageId: DataTypes.INTEGER,
    languageTypeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'LanguageTypeLanguage',
  });
  return LanguageTypeLanguage;
};