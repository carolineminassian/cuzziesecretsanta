'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  purchaser: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  gift: {
    type: String
  }
});

const GiftsPurchased = mongoose.model('GiftsPurchased', schema);

module.exports = GiftsPurchased;
