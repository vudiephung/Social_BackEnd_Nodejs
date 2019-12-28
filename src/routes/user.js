const express = require("express");
const { userValidator, auth } = require("../middleware");
const multer = require("multer");
const {
  createUser,
  loginUser,
  signoutUser,
  signoutAll,
  getUser,
  removeUser,
  getAllUsers,
  updateUser,
  //uploadAvatar,
  handleUploadError,
  getUserById,
  getUserAvatar,
  addFollowing,
  removeFollowing,
  followStatus,
  findUserToFollow
} = require("../controllers/user");

const router = express.Router();

const upload = multer({
  limits: {
    fileSize: 30000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpeg|jpg|JPG)$/))
      return cb(new Error("Your img file is not supported."));
    cb(undefined, true);
  }
});

router.get("/users", getAllUsers);
router.get("/users/findUserToFollow", auth, findUserToFollow);
router.get("/users/:id", getUserById);
router.get("/users/:id/avatar", getUserAvatar);
router.get("/users/me", auth, getUser);
router.get("/users/:id/followStatus", followStatus);

router.put("/users/follow", auth, addFollowing);
router.put("/users/unfollow", auth, removeFollowing);
router.patch("/users/me", auth, updateUser);
router.delete("/users/me", auth, removeUser);
router.post("/signup", userValidator, createUser);
router.post("/login", loginUser);
router.post("/logout", auth, signoutUser);
router.post("/login/all", auth, signoutAll);
// router.post(
//   "/users/me/avatar",
//   auth,
//   upload.single("avatar"),
//   uploadAvatar,
//   handleUploadError
// );

module.exports = router;
