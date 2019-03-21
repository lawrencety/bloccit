const advertisementQueries = require('../db/queries.advertisements.js');

module.exports = {
  index(req, res, next) {
    advertisementQueries.getAllAds((err, advertisements) => {
      if(err) {
        res.redirect(500, 'static/index');
      } else {
        res.render('advertisements/index', {title: 'Advertisements', advertisements});
      }
    })
  },

  new(req, res, next) {
    res.render('advertisements/new', {title: 'New Advertisement'});
  },

  create(req, res, next) {
    let newAd = {
      title: req.body.title,
      description: req.body.description
    };
    advertisementQueries.addAd(newAd, (err, advertisement) => {
      if(err) {
        res.redirect(500, 'advertisements/new');
      } else {
        res.redirect(303, `advertisements/${advertisement.id}`);
      }
    })
  },

  show(req, res, next) {
    advertisementQueries.getAd(req.params.id, (err, advertisement) => {
      if(err || advertisement == null) {
        res.redirect(404, '/');
      } else {
        res.render('advertisements/show', {title: advertisement.title, advertisement});
      }
    })
  },

  destroy(req, res, next) {
    advertisementQueries.deleteAd(req.params.id, (err, advertisement) => {
      if(err) {
        res.redirect(500, `advertisements/${advertisement.id}`);
      } else {
        res.redirect(303, 'advertisements');
      }
    })
  },

  edit(req, res, next) {
    advertisementQueries.getAd(req.params.id, (err, advertisement) => {
      if(err) {
        res.redirect(404, '/');
      } else {
        res.render('advertisements/edit', {title: 'Edit Advertisement', advertisement});
      }
    })
  },

  update(req, res, next) {
    advertisementQueries.updateAd(req.params.id, req.body, (err, advertisement) => {
      if(err || advertisement == null) {
        res.redirect(404, `advertisements/${advertisement.id}/edit`);
      } else {
        res.redirect(`advertisements/${advertisement.id}`);
      }
    })
  }
}
