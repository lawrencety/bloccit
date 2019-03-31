const sequelize = require('../../src/db/models/index').sequelize;
const base = 'http://localhost:3000/topics/'

const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Comment = require('../../src/db/models').Comment;
const Vote = require('../../src/db/models').Vote;

describe('Vote', () => {

  beforeEach((done) => {
    this.user;
    this.topic;
    this.post;
    this.comment;
    this.vote;
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

  describe('#create', () => {

    it('Should create an upvote on a post for a user', (done) => {
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {
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

    it('Should create a downvote on a post for a user', (done) => {
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {
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

    it('Should not create a vote without an assigned user or post', (done) => {
      Vote.create({
        value: 1
      })
      .then((vote) => {
        done();
      })
      .catch((err) => {
        expect(err.message).toContain('Vote.postId cannot be null');
        expect(err.message).toContain('Vote.userId cannot be null');
        done();
      })
    })

  })

  describe('#setUser()', () => {
    it('Should associate a vote and a user', (done) => {
      Vote.create({
        value: -1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {
        this.vote = vote;
        expect(vote.userId).toBe(this.user.id);
        User.create({
          email: 'bob@example.com',
          password: 'password'
        })
        .then((newUser) => {
          this.vote.setUser(newUser)
          .then((vote) => {
            expect(vote.userId).toBe(newUser.id);
            done();
          })
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      })
    })
  })

  describe('#getUser()', () => {
    it('Should return the associated user', (done) => {
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {
        vote.getUser()
        .then((user) => {
          expect(user.id).toBe(this.user.id);
          done();
        })
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    })
  })

  describe('#setPost', () => {
    it('Should associate a vote and a post', (done) => {
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {
        this.vote = vote;
        Post.create({
          title: 'Dress code on Proxima B',
          body: 'Space suit, space helmet, space boots, space gloves',
          topicId: this.topic.id,
          userId: this.user.id
        })
        .then((post) => {
          expect(this.vote.postId).toBe(this.post.id);
          this.vote.setPost(post)
          .then((vote) => {
            expect(vote.postId).toBe(post.id);
            done();
          })
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      })
    })
  })

  describe('#getPost()', () => {
    it('Should return the associated post', (done) => {
      Vote.create({
        value: 1,
        postId: this.post.id,
        userId: this.user.id
      })
      .then((vote) => {
        vote.getPost()
        .then((post) => {
          expect(post.title).toBe('My first visit to Proxima Centauri B');
          done();
        })
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    })
  })

})
