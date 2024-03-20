// server/models/UrlMapping.js

const mongoose = require('mongoose');

const urlMappingSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

const UrlMapping = mongoose.model('UrlMapping', urlMappingSchema);

module.exports = UrlMapping;
