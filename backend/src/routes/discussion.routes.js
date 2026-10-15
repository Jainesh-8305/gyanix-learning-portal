// backend/src/routes/discussion.routes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
router.param('id', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);

const {
  getDiscussions,
  createDiscussion,
  addReply,
  toggleUpvote,
  toggleResolve,
} = require('../controllers/discussion.controller');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getDiscussions);
router.post('/', protect, createDiscussion);
router.post('/:id/reply', protect, addReply);
router.put('/:id/upvote', protect, toggleUpvote);
router.put('/:id/resolve', protect, toggleResolve);

module.exports = router;
