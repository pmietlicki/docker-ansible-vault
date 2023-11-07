var express = require('express');
var router = express.Router();

// Assurez-vous d'avoir une liste des langues supportées
const supportedLanguages = ['en', 'fr', 'es', 'ar', 'bn', 'hi', 'pt', 'ru', 'zh']; // etc.

// Votre route principale
router.get('/', function(req, res, next) {
  // Utilisez une valeur configurée pour le nom de l'hôte si possible, pour éviter les attaques Host header injection
  const safeHost = process.env.SAFE_HOST || 'pascal-mietlicki.fr';
  res.render('index', { host: safeHost, nonce: res.locals.nonce });
});

// Route pour changer la langue
router.get('/change-lang/:lang', function(req, res) {
  const newLang = req.params.lang;
  // Validez que la langue est supportée avant de changer
  if (supportedLanguages.includes(newLang)) {
    req.i18n.changeLanguage(newLang, (err) => {
      if (err) {
        // Utilisez un système de logging approprié
        console.error(`Error changing language to ${newLang}:`, err);
        return res.status(500).send('An error occurred while changing the language.');
      }
      // Redirigez vers un chemin explicite si 'back' n'est pas sûr
      res.redirect('/'); // ou res.redirect('back');
    });
  } else {
    res.status(400).send('Unsupported language specified.');
  }
});

module.exports = router;