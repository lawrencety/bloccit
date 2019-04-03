const User = require('./models').User;
const Post = require('./models').Post;
const Comment = require('./models').Comment;
const bcrypt = require('bcryptjs');

module.exports = {
  createUser(newUser, callback) {
    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);
    return User.create({
      email: newUser.email,
      password: hashedPassword
    })
    .then((user) => {
      callback(null, user);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getUser(id, callback) {
    let result = {};
    return User.findByPk(id)
    .then((user) => {
      if(!user) {
        callback(404);
      } else {
        result['user'] = user;
        Post.scope({ method: ['lastFiveFor', id]}).findAll()
        .then((posts) => {
          result['posts'] = posts;
          Comment.scope({ method: ['lastFiveFor', id]}).findAll()
          .then((comments) => {
            result['comments'] = comments;
            User.scope({ method: ['favoritePosts', id]}).findAll()
            .then((favoritePosts) => {
              result['favoritePosts'] = favoritePosts;
              callback(null, result);
            })
            .catch((err) => {
              callback(err);
            })
          })
        })
      }
    })
  }
}
