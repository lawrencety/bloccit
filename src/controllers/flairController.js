const flairQueries = require('../db/queries.flair.js');

module.exports = {

  show(req, res, next) {
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if(err || flair == null) {
        res.redirect(404, '/');
      } else {
        res.render(303, 'flairs/show', {flair});
      }
    })
  },

  new(req, res, next) {
    res.render(200, 'flairs/new', {postId: req.params.postId})
  },

  create(req, res, next) {
    let newFlair = {
      name: req.body.name,
      color: req.body.color,
      postId: req.params.postId
    }
    flairQueries.addFlair(newFlair, (err, flair) => {
      if(err) {
        res.redirect(500, 'flairs/new');
      } else {
        res.redirect(303, `posts/${flair.postId}/flairs/${flair.id}`)
      }
    })
  },

}
