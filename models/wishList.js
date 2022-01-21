'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  wishListCreator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // wishListItem: {
  //   type: String,
  //   default: ''
  // }
  listName: {
    type: String,
    required: true
  },
  wishListItem: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
    // default: null,
    ref: 'WishListItem'
  }
});

const WishList = mongoose.model('WishList', schema);

module.exports = WishList;
