const Post = require('./models').Post;
const Topic = require('./models').Topic;
const User = require('./models').User;
const Favorite = require('./models').Favorite;
const Authorizer = require('../policies/favorite');

module.exports = {
  createFavorite(req, callback) {
    return Favorite.create({
      postId: req.params.postId,
      userId: req.user.id
    })
    .then((favorite) => {
      callback(null, favorite);
    })
    .catch((err) => {
      callback(err);
    })
  },

  deleteFavorite(req, callback) {
    const id = req.params.id;
    return Favorite.findOne({
      where: {id: id}
    })
    .then((favorite) => {
      if(!favorite) {
        return callback('Favorite not found');
      }
      const authorized = new Authorizer(req.user, favorite).destroy();
      if(authorized) {
        return Favorite.destroy({
          where: {id: id}
        })
        .then((deletedRecordsCount) => {
          callback(null, deletedRecordsCount);
        })
        .catch((err) => {
          callback(err);
        })
      } else {
        req.flash('notice', 'You are not authorized to do that');
        callback(401);
      }
    })
    .catch((err) => {
      callback(err);
    })
  }
}
