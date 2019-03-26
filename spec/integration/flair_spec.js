const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/topics/';
const sequelize = require('../../src/db/models/index').sequelize;
const Topic = require('../../src/db/models').Topic;
const Post = require('../../src/db/models').Post;
const Flair = require('../../src/db/models').Flair;

describe('route : flair', () => {

  beforeEach((done) => {
    this.topic;
    this.post;
    this.flair;
    sequelize.sync({ force: true }).then((res) => {
      Topic.create({
        title: 'Winter Games',
        description: 'Post your Winter Games stories.'
      })
      .then((topic) => {
        this.topic = topic;
        Post.create({
          title: 'Snowball Fighting',
          body: 'So much snow!',
          topicId: this.topic.id
        })
        .then((post) => {
          this.post = post;
          Flair.create({
            name: 'Royal',
            color: 'purple',
            postId: this.post.id
          })
          .then((flair) => {
            this.flair = flair;
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

  describe('GET /topics/:topicId/posts/:postId/flairs/new', () => {
    it('Should render a form for new flair', (done) => {
      request.get(`${base}${this.topic.id}/posts/${this.post.id}/flairs/new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('New Flair');
        done();
      })
    })
  })

  describe('GET /topics/:topicId/posts/:postId/flairs/show', () => {
    it('Should render the view for a flair', (done) => {
      request.get(`${base}${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('Royal');
        done();
      })
    })
  })

  describe('POST /topics/:topicId/posts/:postId/flairs/create', () => {
    it('Should render a new flair with the entered values', (done) => {
      const options = {
        url: `${base}${this.topic.id}/posts/${this.post.id}/flairs/create`,
        form: {
          name: 'Blood',
          color: 'red'
        }
      }
      request.post(options, (err, res, body) => {
        Flair.findOne({
          where: {name: 'Blood'}
        })
        .then((flair) => {
          expect(flair).not.toBeNull();
          expect(flair.name).toBe('Blood');
          expect(flair.color).toBe('red');
          expect(flair.postId).not.toBeNull();
          done();
        })
        .catch((err) => {
          console.log(err);
          done()
        })
      })
    })
  })

  describe('POST /topics/:topicId/posts/:postId/flairs/:id/destroy', () => {
    it('Should delete the selected flair and redirect', (done) => {
      request.post(`${base}${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}/destroy`, (err, res, body) => {
        Flair.findByPk(this.post.id)
        .then((flair) => {
          expect(err).toBeNull();
          expect(flair).toBeNull();
          done();
        })
      })
    })
  })

  describe('GET /topics/:topicId/posts/:postId/flairs/:id/edit', () => {
    it('Should render an edit view of the selected flair', (done) => {
      request.get(`${base}${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('Edit Flair')
        done();
      })
    })
  })

  describe('POST /topics/:topicId/posts/:postId/flairs/:id/update', () => {
    it('Should update the selected flair with the new values', (done) => {
      const options = {
        url: `${base}${this.topic.id}/posts/${this.post.id}/flairs/${this.flair.id}/update`,
        form: {
          name: 'Lavender'
        }
      }
      request.post(options, (err, res, body) => {
        expect(err).toBeNull();
        Flair.findOne({
          where: {id: this.flair.id}
        })
        .then((flair) => {
          expect(flair.name).toBe('Lavender');
          done();
        })
      })
    })
  })

})
