// backend/src/routes/enrollment.routes.js
const express = require('express');
const router = express.Router();
router.param('courseId', (req, res, next) =>
  require('../utils/http').objectIds(req, res, next),
);

const { protect } = require('../middleware/auth');
const {
  enrollFree,
  getMyEnrollments,
  updateProgress,
} = require('../controllers/enrollment.controller');

// All enrollment routes require login
router.use(protect);

router.get('/my', getMyEnrollments);
router.post('/:courseId', enrollFree);
router.put('/:courseId/progress', updateProgress);

router.post(
  '/:courseId/watch',
  protect,
  require('../controllers/enrollment.controller').recordWatch,
);
module.exports = router;
