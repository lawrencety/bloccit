const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/';
const marco = 'http://localhost:3000/marco';


describe('routes : static', () => {

  describe('GET /', () => {

    it('Should return status code 200', (done) => {
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        done();
      })
    })
  })

  describe('GET /marco', () => {

    it('Should return status code 200', (done) => {
      request.get(marco, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        done()
      });
    });

    it('Should return polo in the body', (done) => {
      request.get(marco, (err, res, body) => {
        expect(body).toBe('polo');
        done();
      })
    })

  })
})
