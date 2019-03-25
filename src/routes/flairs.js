const express = require('express');
const router = express.Router();
const flairController = require('../controllers/flairController');

router.get('/posts/:postId/flairs/new', flairController.new);
router.get('/posts/:postId/flairs/:id', flairController.show);
router.post('/posts/:postId/flairs/create', flairController.create);

module.exports = router;
