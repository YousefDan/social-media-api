const router = require("express").Router();
const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { User, validateUpdateUser } = require("../models/User");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyToken");

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

// follow
// unfollow

module.exports = router;
