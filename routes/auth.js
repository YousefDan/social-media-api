const router = require("express").Router();
const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const {
  User,
  validateLoginUser,
  validateRegisterUser,
} = require("../models/User");

/**
 * @desc    Register a new user
 * @route   /api/auth/register
 * @method  POST
 * @access  public
 */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { error } = validateRegisterUser(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send("the user has been registered");
    }

    user = new User(_.pick(req.body, ["username", "email", "password"]));

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const result = await user.save();
    const { __v, password, ...other } = result._doc;
    res.status(201).send(other);
  })
);

/**
 * @desc    Login  user
 * @route   /api/auth/login
 * @method  POST
 * @access  public
 */
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send("invalid email or password");
    }

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordMatch) {
      return res.status(400).send("invalid email or password");
    }

    const token = jwt.sign(
      { _id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET_KEY
    );

    const { __v, password, ...other } = user._doc;
    res.status(200).send({ ...other, token });
  })
);

module.exports = router;
