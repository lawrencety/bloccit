'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {msg: 'must be a valid email'}
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'member'
    }
  }, {});
  User.associate = function(models) {
    User.hasMany(models.Post, {
      foreignKey: 'userId',
      as: 'posts'
    });
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });
    User.hasMany(models.Vote, {
      foreignKey: 'userId',
      as: 'votes'
    });
    User.hasMany(models.Favorite, {
      foreignKey: 'userId',
      as: 'favorites'
    });
    User.addScope('favoritePosts', (userId) => {
      const favorites = {
        include: [{ model: models.Favorite }],
        where: { userId: userId },
        order: [['createdAt', 'DESC']]
      };
      let posts = [];
      for (let i = 0; i < favorites.length; i++) {
        posts.push({
          include: [{ model: models.Post }],
          where: { id: (favorites[i].postId) },
          order: [['createdAt', 'DESC']]
        });
      }
      return posts;
    });
  };
  User.prototype.isAdmin = function() {
    return this.role === 'admin';
  };
  return User;
};
