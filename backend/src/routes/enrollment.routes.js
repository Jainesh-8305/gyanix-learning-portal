// backend/src/routes/enrollment.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { enrollFree, getMyEnrollments, updateProgress } = require('../controllers/enrollment.controller');

// All enrollment routes require login
router.use(protect);

router.get('/my', getMyEnrollments);
router.post('/:courseId', enrollFree);
router.put('/:courseId/progress', updateProgress);

module.exports = router;