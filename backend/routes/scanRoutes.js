const express = require('express');
const router = express.Router();
const { scanUrl, scanFile, getScanHistory } = require('../controllers/scanController');
const { protect } = require('../middlewares/authMiddleware');
const multer = require('multer');

// Configure multer
const upload = multer({ dest: 'uploads/' });

router.post('/url', protect, scanUrl);
router.post('/file', protect, upload.single('file'), scanFile);
router.get('/history', protect, getScanHistory);

module.exports = router;
