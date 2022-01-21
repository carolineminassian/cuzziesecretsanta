'use strict';

const express = require('express');
const router = express.Router();
const User = require('../models/user');
const FriendList = require('../models/friendList');
const WishList = require('../models/wishList');
const WishListItem = require('../models/wishListItem');
const GiftsPurchased = require('../models/giftsPurchased');
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

// display wish list items
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

// add wish list item
router.post('/wishlist-items/:id', routeGuard, (req, res, next) => {
  const { id } = req.params;
  const { wishListItem } = req.body;
  WishList.findById(id)
    .then((list) => {
      if (list) {
        console.log('list exists!!');
        if (String(req.user._id) === String(list.wishListCreator)) {
          return WishListItem.create({
            item: wishListItem,
            creator: req.user._id,
            wishList: list
          }).then((itemDoc) => {
            return WishList.findByIdAndUpdate(id, {
              wishListItem: itemDoc
            });
          });
        } else {
          throw new Error('NOT_AUTHORIZED_TO_ADD_ITEM');
        }
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

// delete a wish list

// edit wish list name

// delete wish list item

// edit wish list item

// display friend's profile with wish list, gift list, question board
router.get('/friend/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  let wishList;
  let male = false;
  let user;
  if (id !== String(req.user._id)) {
    return User.findById(id)
      .then((doc) => {
        user = doc;
        if (doc.gender === 'male') {
          male = true;
        }
      })
      .then(() => {
        return WishList.find({ wishListCreator: id });
      })
      .then((list) => {
        wishList = list;
        return GiftsPurchased.find({ recipient: id });
      })
      .then((giftsPurchased) => {
        res.render('friend-page', { user, male, wishList, giftsPurchased });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    throw new Error('NOT_AUTHORIZED');
  }
});

// add gift purchased to friend's page
router.post('/friend/:id', routeGuard, (req, res, next) => {
  const id = req.params.id;
  const { giftPurchased } = req.body;
  let recipient;
  User.findById(id).then((friend) => {
    recipient = friend;
  });
  return GiftsPurchased.findOne({ recipient: id, gift: giftPurchased })
    .then((giftFound) => {
      if (giftFound) {
        console.log('gift already exists!!', giftFound, giftPurchased);
        throw new Error('GIFT_ALREADY_EXISTS');
      } else {
        console.log('gift does not exist!');
        GiftsPurchased.create({
          purchaser: req.user._id,
          recipient,
          gift: giftPurchased
        });
      }
    })
    .then(() => {
      res.redirect(`/friend/${id}`);
    })
    .catch((error) => {
      next(error);
    });
});

// display friend's wish list detail
router.get('/friend-wishlist-detail/:id', routeGuard, (req, res, next) => {
  const { id } = req.params;
  let wishList;
  let wishListItem;
  return WishList.findById(id)
    .populate('wishListCreator')
    .then((doc) => {
      wishList = doc;
      return WishListItem.find({
        creator: wishList.wishListCreator,
        wishList
      });
    })
    .then((item) => {
      wishListItem = item;
      res.render('friend-wishlist-detail', {
        title: "Cuzzie's Secret Santa!",
        wishListItem,
        wishList
      });
    })
    .catch((error) => {
      next(error);
    });
});

// search for a friend
router.get('/friend-search', routeGuard, (req, res, next) => {
  const name = req.query.name;
  let noInput;
  return User.find({ name })
    .then((userSearchResults) => {
      if (!name) {
        noInput = true;
      } else {
        res.render('friend-search-results', {
          userSearchResults,
          noInput,
          searchUser: true
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

// add someone as a friend

// remove a friend

// add item to gifts purchased on friend's profile

// post question/response to friend's profile

// post response to your profile

module.exports = router;
