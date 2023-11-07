// Le middleware de gestion des erreurs
module.exports = function(err, req, res, next) {
  // Log error stack to console
  console.error(err.stack);
  
  // Renvoyer un code de réponse approprié et un message d'erreur
  res.status(err.status || 500);
  
  // Renvoyer une réponse en fonction du type de contenu attendu
  if (req.accepts('html')) {
    res.render('error', { error: err }); // Rendu d'une page d'erreur avec les détails
  } else if (req.accepts('json')) {
    res.json({ error: 'Error' }); // Renvoi d'une réponse JSON
  } else {
    res.type('txt').send('Error'); // Renvoi d'une réponse texte
  }
};