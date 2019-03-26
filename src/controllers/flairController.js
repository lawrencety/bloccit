const flairQueries = require('../db/queries.flair.js');

module.exports = {

  show(req, res, next) {
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if(err || flair == null) {
        res.redirect(404, '/');
      } else {
        res.render('flairs/show', {flair});
      }
    })
  },

  new(req, res, next) {
    res.render('flairs/new', {postId: req.params.postId})
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

  destroy(req, res, next) {
    flairQueries.deleteFlair(req.params.id, (err, deletedFlairs) => {
      if(err) {
        res.redirect(500, `posts/${req.params.postId}/flairs/${req.params.id}`);
      } else {
        res.redirect(303, `posts/${req.params.postId}`);
      }
    })
  },

  edit(req, res, next) {
    flairQueries.getFlair(req.params.id, (err, flair) => {
      if(err || flair == null) {
        res.redirect(404, `/`);
      } else {
        res.render('flairs/edit', {flair});
      }
    })
  },

  update(req, res, next) {
    flairQueries.updateFlair(req.params.id, req.body, (err, flair) => {
      if(err || flair == null) {
        res.redirect(404, `posts/${req.params.postId}/flairs/${req.params.id}/edit`);
      } else {
        res.redirect(`posts/${req.params.postId}/flairs/${req.params.id}`);
      }
    })
  }

}
