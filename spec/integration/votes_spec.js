const request = require('request');
const server = require('../../src/server');
const sequelize = require('../../src/db/models/index').sequelize;
const base = 'http://localhost:3000/topics/'

const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Comment = require('../../src/db/models').Comment;
const Vote = require('../../src/db/models').Vote;

describe('routes: votes', () => {

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
  describe('Guest attempting to vote on a post', () => {

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

    describe('GET /topics/:topicId/posts/:postId/votes/upvote', () => {
      it('Should not create a new vote', (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
        };
        request.get(options, (err, res, body) => {
          Vote.findOne({
            where: {postId: this.post.id}
          })
          .then((vote) => {
            expect(vote).toBeNull();
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

//TEST SUITE: MEMBER USER---------------------------------------------------------------------------------------------------------------------------------------------
  describe('Member user attempting to vote on a post', () => {

    beforeEach((done) => {
      request.get({
        url: 'http://localhost:3000/auth/fake',
        form: {
          userId: this.user.id
        }
      }, (err, res, body) => {
        done();
      })
    })

    describe('GET /topics/:topicId/posts/:postId/votes/upvote', () => {
      it('Should create a new upvote', (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/upvote`
        };
        request.get(options, (err, res, body) => {
          Vote.findOne({
            where: {postId: this.post.id}
          })
          .then((vote) => {
            expect(vote).not.toBeNull();
            expect(vote.value).toBe(1);
            expect(vote.postId).toBe(this.post.id);
            expect(vote.userId).toBe(this.user.id);
            done();
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        })
      })
    })

    describe('GET /topics/:topicId/posts/:postId/votes/downvote', () => {
      it('Should create a new downvote', (done) => {
        const options = {
          url: `${base}${this.topic.id}/posts/${this.post.id}/votes/downvote`
        };
        request.get(options, (err, res, body) => {
          Vote.findOne({
            where: {postId: this.post.id}
          })
          .then((vote) => {
            expect(vote).not.toBeNull();
            expect(vote.value).toBe(-1);
            expect(vote.postId).toBe(this.post.id);
            expect(vote.userId).toBe(this.user.id);
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
