const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const auditController = require('../controllers/auditController');

// Secure all audit routes with the API Key middleware
router.use(authMiddleware);

router.post('/logs', auditController.createLog);
router.get('/logs', auditController.getLogs);

module.exports = router;
