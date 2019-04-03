const sequelize = require('../../src/db/models/index').sequelize;
const base = 'http://localhost:3000/topics/'

const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Comment = require('../../src/db/models').Comment;
const Favorite = require('../../src/db/models').Favorite;

describe('Favorite', () => {

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

  describe('#create()', () => {

    it('Should create a favorite for a post on a user', (done) => {
      Favorite.create({
        postId: this.post.id,
        userId: this.user.id
      })
      .then((favorite) => { 
        expect(favorite.postId).toBe(this.post.id);
        expect(favorite.userId).toBe(this.user.id);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    })

    it('Should not create a favorite without assigned user or post', (done) => {
      Favorite.create({
        userId: null
      })
      .then((favorite) => {
        done()
      })
      .catch((err) => {
        expect(err.message).toContain('Favorite.postId cannot be null');
        expect(err.message).toContain('Favorite.userId cannot be null');
        done();
      })
    })

  });

  describe('#setUser', () => {
    it('Should associate a favorite and a user together', (done) => {
      Favorite.create({
        postId: this.post.id,
        userId: this.user.id
      })
      .then((favorite) => {
        this.favorite = favorite;
        expect(favorite.userId).toBe(this.user.id);
        User.create({
          email: 'bob@example.com',
          password: 'password'
        })
        .then((newUser) => {
          this.favorite.setUser(newUser)
          .then((favorite) => {
            expect(favorite.userId).toBe(newUser.id);
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
      Favorite.create({
        postId: this.post.id,
        userId: this.user.id
      })
      .then((favorite) => {
        favorite.getUser()
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
    it('Should associate a favorite and a post together', (done) => {
      Favorite.create({
        postId: this.post.id,
        userId: this.user.id
      })
      .then((favorite) => {
        this.favorite = favorite;
        expect(favorite.postId).toBe(this.post.id);
        Post.create({
          title: 'Dress code on Proxima B',
          body: 'Space suit, space helmet, space boots, space gloves',
          topicId: this.topic.id,
          userId: this.user.id
        })
        .then((newPost) => {
          this.favorite.setPost(newPost)
          .then((favorite) => {
            expect(favorite.postId).toBe(newPost.id);
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
      Favorite.create({
        postId: this.post.id,
        userId: this.user.id
      })
      .then((favorite) => {
        favorite.getPost()
        .then((post) => {
          expect(post.id).toBe(this.post.id);
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
