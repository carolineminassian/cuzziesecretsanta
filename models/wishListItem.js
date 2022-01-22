'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  item: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  purchaseLink: {
    type: String
  },
  additionalDetails: {
    type: String,
    maxlength: 150
  },
  wishList: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WishList'
  },
  archivedItem: {
    type: Boolean,
    // default: false,
    required: true
  }
});

const WishListItem = mongoose.model('WishListItem', schema);

module.exports = WishListItem;
