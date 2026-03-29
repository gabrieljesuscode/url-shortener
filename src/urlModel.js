require('dotenv').config()
const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number
});

const urlModel = mongoose.model("Url", urlSchema);

module.exports = urlModel;