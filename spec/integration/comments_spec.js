const request = require('request');
const sequelize = require('../../src/db/models/index').sequelize;
const base = 'http://localhost:3000/topics/'

const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Comment = require('../../src/db/models').Comment;

describe('routes: comments', () => {

  beforeEach((done) => {
    this.user;
    this.topic;
    this.post;
    this.comment;
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
          Comment.create({
            body: 'ay caramba!!!',
            postId: this.post.id,
            userId: this.user.id
          })
          .then((comment) => {
            this.comment = comment;
            done();
          })
          .catch((err) => {
            console.log(err)
            done()
          })
        })
        .catch((err) => {
          console.log(err)
          done()
        })
      })
    })
  })

//TEST SUITE: GUEST USER---------------------------------------------------------------------------------------------------------------------------------------------

  describe('guest attempting to perform CRUD actions for Comment', () => {

    beforeEach((done) => {
      request.get({
        url: 'http://localuser:3000/auth/fake',
        form: {
          userId: 0
        }
      }, (err, res, body) => {
        done();
      })
    })

    describe('POST /topics/:topicId/posts/:postId/comments/create', () => {
      it('Should not create a new comment', (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: 'This comment is amazing!'
          }
        };
        request.post(options, (err, res, body) => {
          Comment.findOne({
            where: {body: 'This comment is amazing!'}
          })
          .then((comment) => {
            expect(comment).toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        })
      })
    })

    describe('POST /topics/:topicId/posts/:postId/comments/destroy', () => {
      it('Should not delete a comment', (done) => {
        Comment.findAll()
        .then((comments) => {
          const commentCountBeforeDelete = comments.length;
          expect(commentCountBeforeDelete).toBe(1);
          request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/destroy`, (err, res, body) => {
            Comment.findAll()
            .then((comments) => {
              expect(err).toBeNull();
              expect(comments.length).toBe(commentCountBeforeDelete);
              done();
            })
          })
        })
      })
    })

  })

//TEST SUITE: NON-OWNER USER---------------------------------------------------------------------------------------------------------------------------------------------
  describe('Non-owner user performing CRUD actions for Comment', () => {

    beforeEach((done) => {
      User.create({
        email: 'rando@example.com',
        password: 'password',
        role: 'member'
      });
      request.get({
        url: 'http://localhost:3000/auth/fake',
        form: {
          email: 'rando@example.com',
          role: 'member',
        }
      }, (err, res, body) => {
        done();
      })
    })

    describe('POST /topics/:topicId/posts/:postId/comments/destroy', () => {
      it('Should not delete a comment', (done) => {
        Comment.findAll()
        .then((comments) => {
          const commentCountBeforeDelete = comments.length;
          expect(commentCountBeforeDelete).toBe(1);
          request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`, (err, res, body) => {
            Comment.findAll()
            .then((comments) => {
              expect(err).toBeNull();
              expect(comments.length).toBe(commentCountBeforeDelete);
              done();
            })
          })
        })
      })
    })

  })

//TEST SUITE: OWNER USER---------------------------------------------------------------------------------------------------------------------------------------------
  describe('Member user performing CRUD actions for Comment', () => {

    beforeEach((done) => {
      request.get({
        url: 'http://localhost:3000/auth/fake',
        form: {
          role: 'member',
          userId: this.user.id
        }
      }, (err, res, body) => {
        done();
      })
    })

    describe('POST /topics/:topicId/posts/:postId/comments/create', () => {
      it('Should create a new comment', (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/comments/create`,
          form: {
            body: 'This comment is amazing!'
          }
        };
        request.post(options, (err, res, body) => {
          Comment.findOne({
            where: {body: 'This comment is amazing!'}
          })
          .then((comment) => {
            expect(comment).not.toBeNull();
            expect(comment.body).toBe('This comment is amazing!');
            expect(comment.id).not.toBeNull();
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        })
      })
    })

    describe('POST /topics/:topicId/posts/:postId/comments/destroy', () => {
      it('Should delete a comment', (done) => {
        Comment.findAll()
        .then((comments) => {
          const commentCountBeforeDelete = comments.length;
          expect(commentCountBeforeDelete).toBe(1);
          request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`, (err, res, body) => {
            expect(res.statusCode).toBe(302);
            Comment.findAll()
            .then((comments) => {
              expect(err).toBeNull();
              expect(comments.length).toBe(commentCountBeforeDelete - 1);
              done();
            })
          })
        })
      })
    })

  })

//TEST SUITE: ADMIN USER---------------------------------------------------------------------------------------------------------------------------------------------
  describe('Admin user performing CRUD actions for Comment', () => {

    beforeEach((done) => {
      User.create({
        email: 'admin@example.com',
        password: 'supersecurepassword',
        role: 'admin'
      });
      request.get({
        url: 'http://localhost:3000/auth/fake',
        form: {
          role: 'admin'
        }
      }, (err, res, body) => {
        done();
      })
    })

    describe('POST /topics/:topicId/posts/:postId/comments/destroy', () => {
      it('Should delete a comment', (done) => {
        Comment.findAll()
        .then((comments) => {
          const commentCountBeforeDelete = comments.length;
          expect(commentCountBeforeDelete).toBe(1);
          request.post(`${base}${this.topic.id}/posts/${this.post.id}/comments/${this.comment.id}/destroy`, (err, res, body) => {
            expect(res.statusCode).toBe(302);
            Comment.findAll()
            .then((comments) => {
              expect(err).toBeNull();
              expect(comments.length).toBe(commentCountBeforeDelete - 1);
              done();
            })
          })
        })
      })
    })

  })

})
