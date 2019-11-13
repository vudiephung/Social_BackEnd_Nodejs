const Post = require("../models/Post");
const sharp = require("sharp");
const User = require("../models/User");

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    await post.populate("comments.postedBy", "_id name email").execPopulate();
    res.send(post);
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({}, null, {
      limit: 6,
      sort: { createdAt: -1 }
    });
    await res.status(200).send(posts);
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.getAllPostsByUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new Error("Invalid User");
  try {
    await user.populate("posts").execPopulate();
    res.send(user.posts);
  } catch (e) {
    res.status(500).send();
  }
};

exports.createPost = async (req, res) => {
  const post = new Post({
    ...req.body,
    owner: req.user._id
  });
  try {
    await post.save();
    res.status(201).send({ post });
  } catch (e) {
    res.status(400).send(e);
  }
};

exports.uploadPostPhoto = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.send({ error: "Invalid ID" });
  const buffer = await sharp(req.file.buffer)
    .resize({
      width: 1000,
      height: 1000
    })
    .png()
    .toBuffer();
  post.photo = buffer;
  await post.save();
  res.status(200).send({ post });
};

exports.handleUploadErrors = (error, req, res, next) => {
  res.status(400).send({ error: error.message });
};

// exports.updatePost = async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdates = ["title", "body", "photo"];
//   try {
//     const isValidUpdate = updates.every(update =>
//       allowedUpdates.includes(update)
//     );
//     if (!isValidUpdate) throw new Error("Invalid Update.");
//     const post = await Post.findOne({
//       _id: req.params.id,
//       owner: req.user._id
//     });
//     console.log("from backend", post);
//     if (!post) throw new Error("Invalid user authentication.");
//     updates.forEach(update => (post[update] = req.body[update]));
//     await post.save();
//     res.status(201).send(post);
//   } catch (error) {
//     res.status(400).send({ error });
//   }
// };

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id
      },
      req.body,
      { new: true }
    );
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!post) throw new Error("Invalid authentication.");
    res.status(200).send(post);
  } catch (e) {
    res.send(500).send(e);
  }
};

exports.removePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.remove();
    res.send({ post });
  } catch (e) {
    res.status(400).send({ error: e });
  }
};

exports.getPostPhoto = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || !post.photo) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(post.photo);
  } catch (e) {
    res.status(404).send();
  }
};

// exports.getAllPostsByFollowedUsers = async (req, res) => {
//   const me = req.user;
// };

exports.like = async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { likes: req.user._id }
      },
      { new: true }
    );
    res.status(201).send(result);
  } catch (error) {
    req.status(400).send({ error });
  }
};

exports.dislike = async (req, res) => {
  const postId = req.params.id;
  try {
    const result = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { likes: req.user._id }
      },
      { new: true }
    );
    res.send(result);
  } catch (error) {
    req.status(400).send({ error });
  }
};

exports.comment = async (req, res) => {
  const postId = req.params.id;
  let comment = req.body.comment;
  comment.postedBy = req.user._id;
  //console.log(comment);
  //   {
  //    text: "This is a commemt",
  //    postedBy: 5dafde3b182fa04324ce2443
  //   };
  try {
    const result = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: comment }
      },
      { new: true }
    );
    await result.populate("comments.postedBy", "_id name email").execPopulate();
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.unComment = async (req, res) => {
  const postId = req.params.id;
  let comment = req.body.comment;
  comment.postedBy = req.user._id;
  // require commentId as "_id" in comment Obj of body request
  try {
    const result = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { _id: comment._id } }
      },
      { new: true }
    );
    res.status(201).send(result);
  } catch (error) {
    res.status(400).send({ error });
  }
};
