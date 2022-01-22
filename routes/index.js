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

// display home page with secret santa rules
router.get('/home', routeGuard, (req, res, next) => {
  res.render('home');
});

// display dashboard with editable wish list, friend list, question board
router.get('/dashboard', routeGuard, (req, res, next) => {
  let wishList;
  // let wishListItem;
  return WishList.find({ wishListCreator: req.user._id, archivedList: false })
    .then((doc) => {
      wishList = doc;
      console.log('wishlist item is', wishList);
      // return WishListItem.find({ creator: req.user._id, wishList });
    })
    .then((item) => {
      // wishListItem = item;
      return FriendList.find({ friendListOwner: req.user._id }).populate(
        'friendsOnList'
      );
    })
    .then((friendList) => {
      res.render('dashboard', {
        title: "Cuzzie's Secret Santa!",
        friendList,
        // wishListItem,
        wishList
      });
    })
    .catch((error) => {
      next(error);
    });
});

// display landing page for unauthenticated users
router.get('/', (req, res, next) => {
  res.render('landing');
});

// display wish list items
router.get('/wishlist-items/:id', routeGuard, (req, res, next) => {
  const { id } = req.params;
  let wishList;
  let wishListItem;
  const notArchived = true;
  return WishList.findById(id)
    .then((doc) => {
      wishList = doc;
      console.log('wishlist item is', wishList);
      return WishListItem.find({
        creator: req.user._id,
        wishList,
        archivedItem: false
      });
    })
    .then((item) => {
      wishListItem = item;
      if (wishList.archivedList) {
        throw new Error('LIST_ARCHIVED');
      } else {
        res.render('wishlist-items', {
          title: wishList.listName,
          wishListItem,
          notArchived
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});
// display archived wish list items
router.get('/archives/wishlist-items/:id', routeGuard, (req, res, next) => {
  const { id } = req.params;
  let wishList;
  let wishListItem;
  const notArchived = false;
  return WishList.findById(id)
    .then((doc) => {
      wishList = doc;
      console.log('wishlist item is', wishList);
      return WishListItem.find({
        creator: req.user._id,
        wishList,
        archivedItem: true
      });
    })
    .then((item) => {
      wishListItem = item;
      res.render('wishlist-items', {
        title: wishList.listName,
        wishListItem,
        notArchived
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
            archivedItem: false,
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

// to delete wish list item
router.post('/wishlist-items/:itemId/delete', routeGuard, (req, res, next) => {
  const { itemId } = req.params;
  let listId;
  WishListItem.findById(itemId)
    .populate('wishList')
    .then((item) => {
      if (item) {
        if (
          item.archivedItem &&
          !item.wishList &&
          String(req.user._id) === String(item.creator)
        ) {
          WishListItem.findByIdAndDelete(itemId).then(() => {
            res.redirect(`/archives/${req.user._id}`);
          });
        } else {
          listId = item.wishList.id;
          console.log('item exists!!');
          if (String(req.user._id) === String(item.creator)) {
            WishListItem.findByIdAndDelete(itemId).then(() => {
              res.redirect(`/wishlist-items/${listId}`);
            });
          } else {
            throw new Error('NOT_AUTHORIZED_TO_DELETE_ITEM');
          }
        }
      }
    })

    .catch((error) => {
      next(error);
    });
});

// add new wish list
router.post('/dashboard', routeGuard, (req, res, next) => {
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
          archivedList: false,
          listName
        });
      }
    })
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      next(error);
    });
});

// delete a wish list
router.post('/wishlist/:listId/delete', routeGuard, (req, res, next) => {
  const { listId } = req.params;
  WishList.findById(listId)
    .then((list) => {
      if (list) {
        console.log('list exists!!');
        if (
          String(req.user._id) === String(list.wishListCreator) &&
          !list.archivedList
        ) {
          WishList.findByIdAndDelete(listId).then(() => {
            res.redirect('/dashboard');
          });
        } else if (
          String(req.user._id) === String(list.wishListCreator) &&
          list.archivedList
        ) {
          WishList.findByIdAndDelete(listId).then(() => {
            res.redirect(`/archives/${req.user._id}`);
          });
        } else {
          throw new Error('NOT_AUTHORIZED_TO_DELETE_LIST');
        }
      }
    })

    .catch((error) => {
      next(error);
    });
});

// display archives
router.get('/archives/:userId', routeGuard, (req, res, next) => {
  const { userId } = req.params;
  let archivedWishList;
  const itemsArchivedAlone = [];
  if (userId === String(req.user._id)) {
    return WishList.find({ archivedList: true })
      .then((doc) => {
        archivedWishList = doc;
        return WishListItem.find({ archivedItem: true }).populate('wishList');
      })
      .then((archivedWishListItems) => {
        // console.log(
        //   'archived items:',
        //   archivedWishListItems,
        //   'archived lists:',
        //   archivedWishList
        // );
        for (let i = 0; i < archivedWishListItems.length; i++) {
          if (!archivedWishListItems[i].wishList) {
            itemsArchivedAlone.push(archivedWishListItems[i]);
          } else if (!archivedWishListItems[i].wishList.archivedList) {
            itemsArchivedAlone.push(archivedWishListItems[i]);
          }
        }

        res.render('archives', { archivedWishList, itemsArchivedAlone });
      })
      .catch((error) => {
        next(error);
      });
  } else {
    throw new Error('UNAUTHORIZED_USER');
  }
});

// archive wish list
router.post('/wishlist/:listId/archive', routeGuard, (req, res, next) => {
  const { listId } = req.params;
  return WishList.findById(listId)
    .then((list) => {
      if (list) {
        console.log('list exists!!');
        if (String(req.user._id) === String(list.wishListCreator)) {
          return WishList.findByIdAndUpdate(listId, { archivedList: true });
        } else {
          throw new Error('NOT_AUTHORIZED_TO_ARCHIVE_LIST');
        }
      }
    })
    .then((wishList) => {
      return WishListItem.updateMany(
        { wishList, archivedItem: false },
        { archivedItem: true }
      );
    })
    .then(() => {
      res.redirect('/dashboard');
    })
    .catch((error) => {
      next(error);
    });
});

// archive item
router.post('/wishlist-items/:itemId/archive', routeGuard, (req, res, next) => {
  const { itemId } = req.params;
  let listId;
  return WishListItem.findById(itemId)
    .then((item) => {
      if (item) {
        console.log('list exists!!');
        listId = item.wishList._id;
        if (String(req.user._id) === String(item.creator)) {
          return WishListItem.findByIdAndUpdate(itemId, { archivedItem: true });
        } else {
          throw new Error('NOT_AUTHORIZED_TO_ARCHIVE_ITEM');
        }
      }
    })
    .then(() => {
      res.redirect(`/wishlist-items/${listId}`);
    })
    .catch((error) => {
      next(error);
    });
});

// edit wish list name

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
  return User.find({ name: { $regex: name, $options: 'i' } })
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
