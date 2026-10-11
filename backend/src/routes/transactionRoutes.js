const express = require('express');
const {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactions,
} = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/export', exportTransactions);
router.get('/', listTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;
