const mongoose = require("mongoose");
const joi = require("joi");

const PostSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      maxlength: 500,
    },
    img: {
      type: String,
      default: "",
    },
    likes: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);

// validate create new post
function validateCreatePost(obj) {
  const schema = joi.object({
    userId: joi.string().required(),
    desc: joi.string().max(500),
    img: joi.string(),
    likes: joi.array(),
  });
  return schema.validate(obj);
}
// validate update new post
function validateUpdatePost(obj) {
  const schema = joi.object({
    userId: joi.string().required(),
    desc: joi.string().max(500),
    img: joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost,
};
