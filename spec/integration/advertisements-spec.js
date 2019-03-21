const request = require('request');
const server = require('../../src/server.js');
const base = 'http://localhost:3000/advertisements/';
const sequelize = require('../../src/db/models/index').sequelize;
const Advertisement = require('../../src/db/models').Advertisement;

describe( 'routes : advertisements ', () => {

  beforeEach((done) => {
    this.advertisement;
    sequelize.sync({ force: true }).then((res) => {
      Advertisement.create({
        title: 'For Sale',
        description: 'Save a lot of money'
      })
      .then((advertisement) => {
        this.advertisement = advertisement;
        done();
      })
      .catch((err) => {
        console.log(err);
        done();
      });
    })
  })

  describe('GET /advertisements', () => {
    it('Should return status code 200', (done) => {
    request.get(base, (err, res, body) => {
      expect(res.statusCode).toBe(200);
      expect(body).toContain('For Sale');
      done();
      })
    })
  })

  describe('GET /advertisements/new', () => {
    it('Should render a new advertisement form', (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('New Advertisement')
        done();
      })
    })
  })

  describe('POST /advertisements/create', () => {
    const options = {
      url: `${base}create`,
      form: {
        title: 'Cellphone Sale',
        description: 'Lot\'s of phones'
      }
    };

    it('Should create a new advertisement and redirect', (done) => {
      request.post(options, (err, res, body) => {
        Advertisement.findOne({where: {title: 'Cellphone Sale'}})
        .then((advertisement) => {
          expect(res.statusCode).toBe(303);
          expect(advertisement.title).toBe('Cellphone Sale');
          expect(advertisement.description).toBe('Lot\'s of phones');
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        })
      })
    })
  })

  describe('GET /advertisements/:id', () => {
    it('Should render a view with a selected Advertisement', (done) => {
      request.get(`${base}${this.advertisement.id}`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('For Sale');
        done();
      })
    })
  })

  describe('POST /advertisements/:id/destroy', () => {
    it('Should delete the advertisement with the associated ID', (done) => {
      Advertisement.findAll()
      .then((advertisements) => {
        let adCountBeforeDelete = advertisements.length;
        expect(adCountBeforeDelete).toBe(1);
        request.post(`${base}${this.advertisement.id}/destroy`, (err, res, body) => {
          Advertisement.findAll()
          .then((advertisements) => {
            expect(err).toBeNull();
            expect(advertisements.length).toBe(adCountBeforeDelete - 1);
            done();
          })
        })
      })
    })
  })

  describe('GET /advertisements/:id/edit', () => {
    it('Should render an edit form', (done) => {
      request.get(`${base}${this.advertisement.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain('Edit Advertisement');
        done();
      })
    })
  })

  describe('POST /advertisements/:id/update', () => {
    it('Should update the advertisement with the given values', (done) => {
      const options = {
        url: `${base}${this.advertisement.id}/update`,
        form: {
          title: 'Items For Sale',
          description: 'Everything discounted'
        }
      };
      request.post(options, (err, res, body) => {
        expect(err).toBeNull();
        Advertisement.findOne({
          where: {id: this.advertisement.id}
        })
        .then((advertisement) => {
          expect(advertisement.title).toBe('Items For Sale');
          done();
        })
      })
    })
  })

})
