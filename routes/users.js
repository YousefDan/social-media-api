const router = require("express").Router();
const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { User, validateUpdateUser } = require("../models/User");
const {
  verifyTokenAndAuthorization,
  verifyToken,
} = require("../middlewares/verifyToken");

/**
 * @desc    Update user
 * @route   /api/users/:id
 * @method  PUT
 * @access  private the user himself or the admin
 */
router.put(
  "/:id",
  verifyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const result = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: _.pick(req.body, [
          "username",
          "email",
          "password",
          "profilePicture",
          "coverPicture",
          "followers",
          "followings",
          "isAdmin",
          "desc",
          "city",
          "from",
          "relationship",
        ]),
      },
      { new: true }
    );

    const { __v, password, ...other } = result._doc;
    res.status(200).send(other);
  })
);

/**
 * @desc    Delete user
 * @route   /api/users/:id
 * @method  DELETE
 * @access  private the user himself or the admin
 */
router.delete(
  "/:id",
  verifyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).send("user has been deleted");
  })
);

/**
 * @desc    Get A user
 * @route   /api/users/:id
 * @method  GET
 * @access  private the user himself or the admin
 */
router.get(
  "/:id",
  verifyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-__v -password");

    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send("not found");
    }
  })
);

/**
 * @desc    Follow A user
 * @route   /api/users/:id/follow
 * @method  PUT
 * @access  private logged in user can follow
 */
router.put(
  "/:id/follow",
  verifyToken,
  asyncHandler(async (req, res) => {
    if (req.user._id !== req.params.id) {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id);

      if (!user.followers.includes(req.user._id)) {
        await user.updateOne({ $push: { followers: req.user._id } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).send("user has been followed");
      } else {
        res.status(403).send("you already followed this user!");
      }
    } else {
      res.status(403).send("you can't follow yourself!");
    }
  })
);

/**
 * @desc    Unfollow A user
 * @route   /api/users/:id/unfollow
 * @method  PUT
 * @access  private logged in user can unfollow
 */
 router.put(
  "/:id/unfollow",
  verifyToken,
  asyncHandler(async (req, res) => {
    if (req.user._id !== req.params.id) {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.user._id);

      if (user.followers.includes(req.user._id)) {
        await user.updateOne({ $pull: { followers: req.user._id } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        res.status(200).send("user has been unfollowed");
      } else {
        res.status(403).send("you are not following this user!");
      }
    } else {
      res.status(403).send("you can't unfollow yourself!");
    }
  })
);

module.exports = router;
