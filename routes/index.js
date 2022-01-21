'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const FriendList = require('../models/friendList');
const WishList = require('../models/wishList');
const WishListItem = require('../models/wishListItem');
const QuestionsAsked = require('../models/questionsAsked');
const routeGuard = require('./../middleware/route-guard');

// display dashboard with editable wish list, friend list, question board
router.get('/', routeGuard, (req, res, next) => {
  let wishList;
  let wishListItem;
  return WishList.find({ wishListCreator: req.user._id })
    .then((doc) => {
      wishList = doc;
      console.log('wishlist item is', wishList);
      return WishListItem.find({ creator: req.user._id, wishList });
    })
    .then((item) => {
      wishListItem = item;
      return FriendList.find({ friendListOwner: req.user._id }).populate(
        'friendsOnList'
      );
    })
    .then((friendList) => {
      res.render('dashboard', {
        title: "Cuzzie's Secret Santa!",
        friendList,
        wishList,
        wishListItem
      });
    })
    .catch((error) => {
      next(error);
    });
});
router.get('/wishlist-items/:id', routeGuard, (req, res, next) => {
  const { id } = req.params;
  let wishList;
  let wishListItem;
  return WishList.findById(id)
    .then((doc) => {
      wishList = doc;
      console.log('wishlist item is', wishList);
      return WishListItem.find({ creator: req.user._id, wishList });
    })
    .then((item) => {
      wishListItem = item;
      res.render('wishlist-items', {
        title: "Cuzzie's Secret Santa!",
        wishListItem
      });
    })
    .catch((error) => {
      next(error);
    });
});

router.post('/wishlist-items/:id', routeGuard, (req, res, next) => {
  const { id } = req.params;
  const { wishListItem } = req.body;
  WishList.findById(id)
    .then((list) => {
      if (list) {
        console.log('list exists!!');
        return WishListItem.create({
          item: wishListItem,
          creator: req.user._id,
          wishList: list
        }).then((itemDoc) => {
          return WishList.findByIdAndUpdate(id, {
            wishListItem: itemDoc
          });
        });
      }
    })
    .then(() => {
      res.redirect(`/wishlist-items/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

// add new wish list
router.post('/', routeGuard, (req, res, next) => {
  const id = req.user._id;
  const { listName } = req.body;
  WishList.findOne({ wishListCreator: id, listName })
    .then((list) => {
      if (list) {
        console.log('list already exists!!', listName);
        throw new Error('LIST_ALREADY_EXISTS');
      } else {
        console.log('list does not exist!');
        WishList.create({
          wishListCreator: id,
          wishListItem: null,
          listName
        });
      }
    })
    .then(() => {
      res.redirect('/');
    })
    .catch((error) => {
      next(error);
    });
});

// display friend's profile with wish list, gift list, question board
router.get('/friend/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  if (id !== String(req.user._id)) {
    FriendList.findOne({ friendListOwner: req.user._id });
    res.render('friend-page', { friend: '' });
  } else {
    throw new Error(NOT_AUTHORIZED);
  }
});

// add item to gifts purchased on friend's profile

// post question/response to friend's profile

// post response to your profile

module.exports = router;
