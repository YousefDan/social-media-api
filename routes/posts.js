const router = require("express").Router();
const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/Post");
const { User } = require("../models/User");
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

/**
 *  @desc    Like or Dislike a post
 *  @route   /api/posts/:postId/like
 *  @method  PUT
 *  @access  private only authenticated
 */
router.put(
  "/:postId/like",
  verifyToken,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post.likes.includes(req.user._id)) {
      await post.updateOne({ $push: { likes: req.user._id } });
      res.status(200).send("the post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.user._id } });
      res.status(200).send("the post has been disliked");
    }
  })
);

/**
 *  @desc    Get a post
 *  @route   /api/posts/:postId
 *  @method  GET
 *  @access  private
 */
router.get(
  "/:postId",
  verifyToken,
  asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);
    res.status(200).send(post);
  })
);
/**
 *  @desc    Get timeline posts
 *  @route   /api/posts/timeline/all
 *  @method  GET
 *  @access  private
 */
router.get(
  "/timeline/all",
  verifyToken,
  asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => Post.find({ userId: friendId }))
    );
    res.status(200).json(userPosts.concat(...friendPosts));
  })
);

module.exports = router;
