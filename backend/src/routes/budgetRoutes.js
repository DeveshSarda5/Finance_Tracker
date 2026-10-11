const express = require('express');
const { listBudgets, upsertBudget, deleteBudget } = require('../controllers/budgetController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', listBudgets);
router.post('/', upsertBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
