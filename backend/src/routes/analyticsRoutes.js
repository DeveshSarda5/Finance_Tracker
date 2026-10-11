const express = require('express');
const { summary, spendingByCategory, trend } = require('../controllers/analyticsController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/summary', summary);
router.get('/spending-by-category', spendingByCategory);
router.get('/trend', trend);

module.exports = router;
