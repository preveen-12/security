const crypto = require('crypto');
const fs = require('fs');
const Scan = require('../models/Scan');

const ALGORITHM = 'aes-256-cbc';
const ITERATIONS = 100000;
const KEY_LENGTH = 32;

const getDerivedKey = (pin, salt) => {
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(pin, salt, ITERATIONS, KEY_LENGTH, 'sha512', (err, key) => {
            if (err) reject(err);
            else resolve(key);
        });
    });
};

const encryptImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File is required' });
        const { pin } = req.body;
        if (!pin) return res.status(400).json({ message: 'PIN is required' });

        const filePath = req.file.path;
        const fileBuffer = fs.readFileSync(filePath);

        const salt = crypto.randomBytes(16);
        const iv = crypto.randomBytes(16);

        const key = await getDerivedKey(pin, salt);

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

        const finalBuffer = Buffer.concat([salt, iv, encrypted]);

        fs.unlinkSync(filePath);

        await Scan.create({
            userId: req.user.id,
            type: 'vault_swap',
            target: req.file.originalname,
            riskLevel: 'Safe',
            ip: '127.0.0.1',
            location: { country: 'Localhost', city: 'Image Vault' },
            threatTable: [{ engine: 'AES-256-CBC', result: 'secure' }],
            details: 'Total Swap: Original image encrypted and deleted. .vault block generated.',
            fileSize: req.file.size
        });

        res.set('Content-Type', 'application/octet-stream');
        res.set('Content-Disposition', `attachment; filename="${req.file.originalname}.vault"`);
        res.send(finalBuffer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Encryption failed' });
    }
};

const decryptImage = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'File is required' });
        const { pin } = req.body;
        if (!pin) return res.status(400).json({ message: 'PIN is required' });

        const filePath = req.file.path;
        const finalBuffer = fs.readFileSync(filePath);

        if (finalBuffer.length < 32) {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Invalid encrypted file format' });
        }

        const salt = finalBuffer.subarray(0, 16);
        const iv = finalBuffer.subarray(16, 32);
        const encryptedData = finalBuffer.subarray(32);

        const key = await getDerivedKey(pin, salt);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        try {
            const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
            fs.unlinkSync(filePath);

            let originalName = req.file.originalname;
            if (originalName.endsWith('.vault')) {
                originalName = originalName.slice(0, -6);
            }

            res.set('Content-Type', 'application/octet-stream');
            res.set('Content-Disposition', `attachment; filename="${originalName}"`);
            res.send(decrypted);

            await Scan.create({
                userId: req.user.id,
                type: 'vault_swap',
                target: originalName,
                riskLevel: 'Safe',
                ip: '127.0.0.1',
                location: { country: 'Localhost', city: 'Image Vault' },
                threatTable: [{ engine: 'AES-256-CBC', result: 'secure' }],
                details: 'Total Swap: .vault block decrypted and deleted. Original image restored.',
                fileSize: req.file.size
            });

        } catch (decryptErr) {
            fs.unlinkSync(filePath);
            return res.status(401).json({ message: 'Decryption failed: Incorrect PIN.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Decryption failed' });
    }
};

module.exports = { encryptImage, decryptImage };
