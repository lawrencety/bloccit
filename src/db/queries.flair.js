const Flair = require('./models').Flair;

module.exports = {

  addFlair(newFlair, callback) {
    return Flair.create(newFlair)
    .then((flair) => {
      callback(null, flair);
    })
    .catch((err) => {
      callback(err);
    })
  },

  getFlair(id, callback) {
    return Flair.findByPk(id)
    .then((flair) => {
      callback(null, flair);
    })
    .catch((err) => {
      callback(err);
    })
  },

};
