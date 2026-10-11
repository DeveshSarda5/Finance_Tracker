const express = require('express');
const { listInvestments, createInvestment, deleteInvestment } = require('../controllers/investmentController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', listInvestments);
router.post('/', createInvestment);
router.delete('/:id', deleteInvestment);

module.exports = router;
