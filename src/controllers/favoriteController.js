const favoriteQueries = require('../db/queries.favorites.js');

module.exports = {

  create(req, res, next) {
    if(req.user) {
      console.log('CALLING QUERY')
      favoriteQueries.createFavorite(req, (err, favorite) => {
        if(err) {
          req.flash('error', err);
        }
      })
    } else {
      req.flash('notice', 'You must be signed in to do that')
    }
    res.redirect(req.headers.referer)
  },

  destroy(req, res, next) {
    if(req.user) {
      favoriteQueries.deleteFavorite(req, (err, favorite) => {
        if(err) {
          req.flash('error', err);
        }
      })
    } else {
      req.flash('notice', 'You must be signed in to do that')
    }
    res.redirect(req.headers.referer);
  }

}