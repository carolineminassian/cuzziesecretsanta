'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  friendAvatar: {
    type: String
  },
  friendsOnList: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  friendListOwner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
});

const FriendList = mongoose.model('FriendList', schema);

module.exports = FriendList;
