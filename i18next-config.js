
const i18next = require('i18next');
const Backend = require('i18next-node-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: __dirname + '/locales/{{lng}}.json',
    },
    detection: {
      order: ['querystring', 'cookie', 'header'],
      caches: ['cookie']
    },
    preload: ['en', 'fr'] // Add all languages you want to support
  });

module.exports = i18next;
