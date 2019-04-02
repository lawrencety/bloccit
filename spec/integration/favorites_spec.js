const request = require('request');
const sequelize = require('../../src/db/models/index').sequelize;
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/';

const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Comment = require('../../src/db/models').Comment;
const Favorite = require('../../src/db/models').Favorite;

describe('routes: favorite', () => {

  beforeEach((done) => {
    this.user;
    this.topic;
    this.post;
    this.comment;
    this.favorite;
    sequelize.sync({force: true}).then((res) => {
      User.create({
        email: 'starman@tesla.com',
        password: 'Trekkie4lyfe',
        role: 'member'
      })
      .then((user) => {
        this.user = user;
        Topic.create({
          title: 'Expeditions to Alpha Centauri',
          description: 'A compilation of reports from recent visits to the star system.',
          posts: [{
            title: 'My first visit to Proxima Centauri B',
            body: 'I saw some rocks.',
            userId: this.user.id
          }]
        },
        { include: {
          model: Post,
          as: 'posts'
          }
        })
        .then((topic) => {
          this.topic = topic;
          this.post = topic.posts[0];
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      })
    })
  })

//GUEST USER: TEST SUITE----------------------------------------------------------------------------------------------------------------------------------
  describe('guest attempting to favorite a post', () => {

    beforeEach((done) => {
      request.get({
        url: 'http://localhost:3000/auth/fake',
        form: {
          userId: 0
        }
      }, (err, res, body) => {
        done();
      })
    })

    describe('POST /topics/:topicId/posts/:postId/favorites/create', () => {
      it('Should not create a new favorite', (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/favorites/create`
        };
        let favCountBeforeCreate;
        this.post.getFavorites()
        .then((favorites) => {
          favCountBeforeCreate = favorites.length;
          request.post(options, (err, res, body) => {
            this.post.getFavorites()
            .then((newFavorites) => {
              expect(newFavorites.length).toBe(favCountBeforeCreate);
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            })
          })
        })
      })
    })

  })

//MEMBER USER: TEST SUITE----------------------------------------------------------------------------------------------------------------------------------
  describe('member user attempting to create and destroy a favorite', () => {

    beforeEach((done) => {
      request.get({
        url: 'http://localhost:3000/auth/fake',
        form: {
          userId: this.user.id,
          email: this.user.email,
          role: 'member'
        }
      }, (err, res, body) => {
        request.post(`${base}${this.topic.id}/posts/${this.post.id}/favorites/create`, (err, res, body) => {
          Favorite.findOne({
            where: {
              postId: this.post.id
            }
          })
          .then((favorite) => {
            this.favorite = favorite;
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        })
      })
    })

    describe('POST /topics/:topicId/posts/:postId/favorites/create', () => {
      it('Should create a new favorite', (done) => {
        Favorite.findOne({
          where: {
            userId: this.user.id,
            postId: this.post.id
          }
        })
        .then((favorite) => {
          expect(favorite).not.toBeNull();
          expect(favorite.userId).toBe(this.user.id);
          expect(favorite.postId).toBe(this.post.id);
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      })
    })

    fdescribe('POST /topics/:topicId/posts/:postId/favorites/destroy', () => {
      it('Should delete a favorite', (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/favorites/${this.favorite.id}/destroy`
        };
        this.post.getFavorites()
        .then((favorites) => {
          let favCountBeforeDelete = favorites.length;
          request.post(options, (err, res, body) => {
            this.post.getFavorites()
            .then((newFavorites) => {
              console.log(newFavorites)
              expect(newFavorites.length).toBe(favCountBeforeDelete - 1);
              done();
            })
            .catch((err) => {
              console.log(err);
              done();
            })
          })
        })
      })
    })

  })

})
