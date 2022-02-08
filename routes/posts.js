const router = require("express").Router();
const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const { verifyToken } = require("../middlewares/verifyToken");

/**
 *  @desc    Create a post
 *  @route   /api/posts
 *  @method  POST
 *  @access  private only authorized user
 */
router.post(
  "/",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { error } = validateCreatePost(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    if (req.user._id === req.body.userId) {
      const post = new Post(
        _.pick(req.body, ["userId", "desc", "img", "likes"])
      );
      const result = await post.save();
      res.status(201).send(result);
    } else {
      res.status(403).send("access denied");
    }
  })
);

/**
 *  @desc    Update a post
 *  @route   /api/posts/:postId
 *  @method  PUT
 *  @access  private only user himself
 */
router.put(
  "/:postId",
  verifyToken,
  asyncHandler(async (req, res) => {
    const { error } = validateUpdatePost(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    if (req.user._id === req.body.userId) {
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.postId,
        {
          $set: _.pick(req.body, ["desc", "img"]),
        },
        { new: true }
      );

      res.status(200).send(updatedPost);
    } else {
      res.status(403).send("access denied. you can only update your post");
    }
  })
);

/**
 *  @desc    Delete a post
 *  @route   /api/posts/:postId
 *  @method  DELETE
 *  @access  private only user himself or admin
 */
router.delete(
  "/:postId",
  verifyToken,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (req.user._id === post.userId || req.user.isAdmin) {
      await Post.findByIdAndDelete(req.params.postId);
      res.status(200).send("post has been deleted");
    } else {
      res.status(403).send("you are not allowed");
    }
  })
);

module.exports = router;
