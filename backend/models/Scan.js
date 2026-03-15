const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['url', 'file', 'metadata', 'vault_swap'],
    required: true,
  },
  target: {
    type: String, // The URL or the file name
    required: true,
  },
  riskLevel: {
    type: String,
    enum: ['Safe', 'Suspicious', 'Malicious'],
    required: true,
  },
  ip: {
    type: String,
  },
  location: {
    country: String,
    city: String
  },

  // URL-Specific Intelligence
  domainName: String,
  registrar: String,
  domainAge: String,
  sslStatus: Boolean,
  hsts: Boolean,
  csp: Boolean,

  // File-Specific Intelligence
  sha256: String,
  md5: String,
  mimeType: String,
  fileSize: Number,
  detectionRatio: String,

  // Forensic Intelligence
  cameraModel: String,
  software: String,
  originalTimestamp: String,
  dimensions: String,
  gps: {
    latitude: Number,
    longitude: Number
  },
  steganographyRisk: String,
  actualSize: Number,
  expectedSize: Number,

  threatTable: [{
    engine: String,
    result: String
  }],
  details: {
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
