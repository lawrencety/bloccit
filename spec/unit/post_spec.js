const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;
const Vote = require('../../src/db/models').Vote;

describe('Post', () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;
    sequelize.sync({ force: true}).then((res) => {
      User.create({
        email: 'starman@tesla.com',
        password: 'Trekkie4lyfe'
      })
      .then((user) => {
        this.user = user;
        Topic.create({
          title: 'Expeditions to Alpha Centauri',
          description: 'A compilation of reports from recent visits to the star system.',
          posts: [{
            title: 'My first visit to Proxima Centauri B',
            body: 'I saw some rocks.',
            userId: this.user.id,
            votes: []
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
        });
      })
    })
  });

  describe('#create()', () => {
    it('Should create an object with a title, body, assigned topic, and user', (done) => {
      Post.create({
        title: 'Pros of cryosleep during the long journey',
        body: '1. Not having to answer the \"Are we there yet?\" question.',
        topicId: this.topic.id,
        userId: this.user.id
      })
      .then((post) => {
        expect(post.title).toBe('Pros of cryosleep during the long journey');
        expect(post.body).toBe('1. Not having to answer the \"Are we there yet?\" question.');
        expect(post.topicId).toBe(this.topic.id);
        expect(post.userId).toBe(this.user.id);
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      })
    });

    it('Should not create a post with a missing title, body, or assigned topic', (done) => {
      Post.create({
        title: 'Pros of cryosleep during the long journey'
      })
      .then(() => {
        done();
      })
      .catch((err) => {
        expect(err.message).toContain('Post.body cannot be null');
        expect(err.message).toContain('Post.topicId cannot be null');
        done();
      })
    });
  })

  describe('#setTopic()', () => {
    it('Should associate a topic and a post together', (done) => {
      Topic.create({
        title: 'Challenges of interstellar travel',
        description: '1. The WiFi is terrible'
      })
      .then((newTopic) => {
        expect(this.post.topicId).toBe(this.topic.id);
        this.post.setTopic(newTopic)
        .then((post) => {
          expect(post.topicId).toBe(newTopic.id);
          done();
        })
      })
    })
  })

  describe('#getTopic()', () => {
    it('Should return the associated topic', (done) => {
      this.post.getTopic()
      .then((associatedTopic) => {
        expect(associatedTopic.title).toBe('Expeditions to Alpha Centauri');
        done();
      })
    })
  })

  describe('#setUser()', () => {
    it('Should associate a post and a user together', (done) => {
      User.create({
        email: 'ada@example.com',
        password: 'password'
      })
      .then((newUser) => {
        expect(this.post.userId).toBe(this.user.id);
        this.post.setUser(newUser)
        .then((post) => {
          expect(this.post.userId).toBe(newUser.id);
          done();
        })
      })
    })
  })

  describe('#getUser()', () => {
    it('Should return the associated user', (done) => {
      this.post.getUser()
      .then((user) => {
        expect(user.email).toBe('starman@tesla.com');
        done();
      })
    })
  })

  describe('Voting methods', () => {

    describe('getPoints()', () => {
      it('Should get the total number of points on a given post', (done) => {
        const currentPoints = this.post.getPoints();
        expect(currentPoints).toBe(0);
        Vote.create({
          value: 1,
          postId: this.post.id,
          userId: this.user.id
        })
        .then((vote) => {
          expect(this.post.getPoints()).toBe(currentPoints + 1);
          done();
        })
      })
    })

    describe('hasUpvoteFor(:user)', () => {
      it('Should return true if there is an upvote for the entered user in the post', (done) => {
        expect(this.post.hasUpvoteFor(this.user)).toBe(false);
        Vote.create({
          value: 1,
          postId: this.post.id,
          userId: this.user.id
        })
        .then((vote) => {
          expect(this.post.hasUpvoteFor(this.user)).toBe(true);
          done();
        })
      })
    })

    describe('hasDownvoteFor(:user)', () => {
      it('Should return true if there is a downvote for the entered user in the post', (done) => {
        expect(this.post.hasDownvoteFor(this.user)).toBe(false);
        Vote.create({
          value: -1,
          postId: this.post.id,
          userId: this.user.id
        })
        .then((vote) => {
          expect(this.post.hasDownvoteFor(this.user)).toBe(true);
          done();
        })
      })
    })

  })

})
