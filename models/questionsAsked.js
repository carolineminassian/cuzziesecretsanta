'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  wishListItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WishList'
  },
  question: {
    type: String
  },
  reply: {
    type: String
  }
});

const QuestionsAsked = mongoose.model('QuestionsAsked', schema);

module.exports = QuestionsAsked;
