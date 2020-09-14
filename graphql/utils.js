const UserLanguage = require('../models').UserLanguage;
const User = require('../models').User;
const LanguageType = require('../models').LanguageType;
const LanguageTypesLanguage = require('../models').LanguageTypeLanguage;
const Languages = require('../models').Language;

module.exports.paginateResults = ({
  after: cursor,
  pageSize = 20,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  if (pageSize < 1) return [];

  if (!cursor) return results.slice(0, pageSize);
  const cursorIndex = results.findIndex(item => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  return cursorIndex >= 0
    ? cursorIndex === results.length - 1 // don't let us overflow
      ? []
      : results.slice(
        cursorIndex + 1,
        Math.min(results.length, cursorIndex + 1 + pageSize),
      )
    : results.slice(0, pageSize);
};

module.exports.createStore = () => {

  const users = User;
  users.sync();

  const userLanguages = UserLanguage;
  userLanguages.sync();

  const languageTypes = LanguageType;
  languageTypes.sync();

  const languageTypesLanguage = LanguageTypesLanguage;
  languageTypesLanguage.sync();

  const languages = Languages;
  languages.sync();

  return { users, userLanguages, languages, languageTypes, languageTypesLanguage };
};
