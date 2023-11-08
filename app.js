const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');
const errorHandler = require('./middlewares/errorHandler');
const crypto = require('crypto');

const app = express();
const cors = require('cors');

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": [
        "'self'",
        "https://code.jquery.com",
        "https://cdn.jsdelivr.net",
        "https://stackpath.bootstrapcdn.com",
        (req, res) => `'nonce-${res.locals.nonce}'`,
      ],
      "script-src-attr": ["'unsafe-inline'"], // Permettre les gestionnaires d'événements inline
    },
  })
);

// Limitation du taux de requêtes pour prévenir les attaques par force brute et DoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre de temps
});
app.use(limiter);

// Support json et urlencoded avec des limites pour le corps des requêtes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Initialisation de i18next pour la gestion des langues
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: path.join(__dirname, '/locales/{{lng}}/{{ns}}.json')
    },
    detection: {
      order: ['querystring', 'cookie'],
      caches: ['cookie']
    }
  });

app.use(middleware.handle(i18next));

// Configuration de la vue
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares standards
app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.options('/api', cors(corsOptions));
app.use('/api', cors(), apiRouter);

// Gestion des erreurs 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Gestion des erreurs
app.use(errorHandler);

module.exports = app;