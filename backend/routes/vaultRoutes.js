const express = require('express');
const router = express.Router();
const multer = require('multer');
const { encryptImage, decryptImage } = require('../controllers/vaultController');
const { protect } = require('../middlewares/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.post('/encrypt', protect, upload.single('file'), encryptImage);
router.post('/decrypt', protect, upload.single('file'), decryptImage);

module.exports = router;
