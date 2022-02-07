const mongoose = require("mongoose");
const joi = require("joi");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 40,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    maxlength: 70,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
  },
  profilePicture: {
    type: String,
    default: "",
  },
  coverPicture: {
    type: String,
    default: "",
  },
  followers: {
    type: Array,
    default: [],
  },
  followings: {
    type: Array,
    default: [],
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  desc: String,
  city: String,
  from: String,
  relationship: {
    type: Number,
    enum: [1, 2, 3],
  },
});

const User = mongoose.model("User", UserSchema);

// validate register user
function validateRegisterUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(3).max(40).required(),
    email: joi.string().trim().max(70).required().email(),
    password: joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}
// validate login user
function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().max(70).required(),
    password: joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}
// validate update user
function validateUpdateUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(3).max(40),
    email: joi.string().trim().max(70).email(),
    password: joi.string().trim().min(8),
    profilePicture: joi.string(),
    coverPicture: joi.string(),
    followers: joi.array(),
    followings: joi.array(),
    isAdmin: joi.boolean(),
    desc: joi.string(),
    city: joi.string(),
    from: joi.string(),
    relationship: joi.number(),
    _id: joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
