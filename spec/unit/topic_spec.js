const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;

describe('Topic', () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    sequelize.sync({ force: true}).then((res) => {
      Topic.create({
        title: 'Expeditions to Alpha Centauri',
        description: 'A compilation of reports from recent visits to the star system.'
      })
      .then((topic) => {
        this.topic = topic;
        Post.create({
          title: 'My first visit to Proxima Centauri B',
          body: 'I saw some rocks.',
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          done();
        });
      })
      .catch((err) => {
        console.log(err);
        done();
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
