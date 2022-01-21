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
  wishList: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'WishList'
  }
});

const WishListItem = mongoose.model('WishListItem', schema);

module.exports = WishListItem;
