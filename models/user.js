'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHashAndSalt: {
    type: String
  },
  profilePic: {
    type: String
  },
  gender: {
    type: String,
    required: true
  },
  wishList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WishList'
  },
  friendList: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FriendList'
  }
});

const User = mongoose.model('User', schema);

module.exports = User;
