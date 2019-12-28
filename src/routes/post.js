const express = require("express");
const {
  getPosts,
  createPost,
  getAllPostsByUser,
  updatePost,
  removePost,
  getPostPhoto,
  getPostById,
  like,
  dislike,
  comment,
  unComment
} = require("../controllers/post");

const { createPostValidator, auth } = require("../middleware");
const multer = require("multer");

const router = express.Router();

// const upload = multer({
//   limits: { fileSize: 30000000 },
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(png|jpg|jpeg)$/))
//       return cb(new Error("Your image file is not supported."));
//     cb(undefined, true);
//   }
// });

router.get("/posts/:id", getPostById);
router.get("/posts", getPosts);
router.get("/:id/posts", getAllPostsByUser);
router.post("/me/post", auth, createPostValidator, createPost);
router.get("/posts/photo/:id", getPostPhoto);
router.patch("/me/posts/:id", auth, updatePost);
router.delete("/me/posts/:id", auth, removePost);
router.put("/posts/:id/like", auth, like);
router.put("/posts/:id/dislike", auth, dislike);
router.put("/posts/:id/comment", auth, comment);
router.put("/posts/:id/uncomment", auth, unComment);

module.exports = router;
