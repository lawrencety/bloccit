const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const User = require('../../src/db/models').User;

describe('Topic', () => {
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
        });
      })
    })
  });

  describe('#create()', () => {
    it('Should create a new topic with the entered values', (done) => {
      sequelize.sync({ force: true}).then((res) => {
        Topic.create({
          title: 'Cool stuff',
          description: 'A list of cool stuff'
        })
        .then((topic) => {
          expect(topic.title).toBe('Cool stuff');
          expect(topic.description).toBe('A list of cool stuff');
          done();
        })
      })
    })
  })

  describe('#getPosts()', () => {
    it('Should return an array of posts associated with the topic', (done) => {
      this.topic.getPosts()
      .then((posts) => {
        let post = posts.pop();
        expect(post.title).toBe('My first visit to Proxima Centauri B');
        expect(post.body).toBe('I saw some rocks.');
        done();
      })
    })
  })

})
