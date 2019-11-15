const User = require("../models/User");
const sharp = require("sharp");
const { sendWelcomeEmail } = require("../emails/account");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select(
      "_id name email about followings followers"
    );
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-__v -tokens -password"
    );
    res.status(200).send(user);
  } catch (error) {
    res.status(400).send({
      error: "Cannot find a User with the given ID. Please try  again!"
    });
  }
};

exports.createUser = async (req, res) => {
  delete req.body.confirmPassword;
  const user = new User(req.body);
  try {
    await user.save();
    const token = await user.generateAuthToken();
    sendWelcomeEmail(user.email, user.name);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: e });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send({ error: "Unable to Login" });
  }
};

exports.signoutUser = async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
};

exports.signoutAll = async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    console.log(req.user.tokens);
    res.send();
  } catch (e) {
    res.status(500).send();
  }
};

exports.getUser = async (req, res) => {
  res.status(200).send(req.user);
};

exports.removeUser = async (req, res) => {
  try {
    await req.user.remove();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(500).send();
  }
};

exports.updateUser = async (req, res) => {
  const allowUpdates = ["name", "email", "password", "about"];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every(update => allowUpdates.includes(update));
  if (!isValidUpdate) {
    throw new Error("Invalid Update!");
  }
  try {
    updates.forEach(update => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.uploadAvatar = async (req, res) => {
  const buffer = await sharp(req.file.buffer)
    .resize({
      width: 1000,
      height: 1000
    })
    .png()
    .toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.status(200).send(req.user);
};

exports.handleUploadError = (error, req, res, next) => {
  res.status(400).send({ error: error.message });
};

exports.anotherLogout = function(req, res) {
  cookie = req.cookies;
  for (var prop in cookie) {
    if (!cookie.hasOwnProperty(prop)) {
      continue;
    }
    res.cookie(prop, "", { expires: new Date(0) });
  }
  res.redirect("/");
};

exports.getUserAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send();
  }
};

exports.addFollowing = async (req, res) => {
  try {
    const followId = req.body.followId;
    const userFollowed = await User.findById(followId);

    await User.findByIdAndUpdate(req.user._id, {
      $push: { followings: followId }
    });
    await User.findByIdAndUpdate(followId, {
      $push: { followers: req.user._id }
    });

    await req.user.populate("followingsVirtual", "_id name").execPopulate();
    await userFollowed.populate("followersVirtual", "_id name").execPopulate();

    res.send({
      usersYouFollow: req.user.followingsVirtual,
      thisUserIsFollowedBy: userFollowed.followersVirtual
    });
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.followStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select(
      "_id name email about followings followers"
    );

    await user.populate("followingsVirtual", "_id name").execPopulate();
    await user.populate("followersVirtual", "_id name").execPopulate();

    //const summary = `User ${user.name} follows ${user.followingsVirtual.length} users and is followed by ${user.followersVirtual.length} users`;

    res.send({
      thisUserFollowing: user.followingsVirtual,
      thisUserIsFollowedBy: user.followersVirtual
    });
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.removeFollowing = async (req, res) => {
  try {
    const unfollowId = req.body.unfollowId; // userId that needs to be unfollowed
    const userUnfollowed = await User.findById(unfollowId); // corresponding user

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { followings: unfollowId }
    });
    await User.findByIdAndUpdate(unfollowId, {
      $pull: { followers: req.user._id }
    });

    await userUnfollowed
      .populate("followersVirtual", "_id name")
      .execPopulate();
    await req.user.populate("followingsVirtual", "_id name").execPopulate();

    res.send({
      thisUserFollowing: req.user.followingsVirtual,
      thisUserIsFollowedBy: userUnfollowed.followersVirtual
    });
  } catch (error) {
    res.status(400).send({ error });
  }
};

exports.findUserToFollow = async (req, res) => {
  const { followings, _id } = req.user;
  followings.push(_id);
  try {
    const response = await User.find({ _id: { $nin: followings } }).select(
      "_id name"
    );
    res.send(response);
  } catch (e) {
    res.status(400).send({ error: e });
  }
};
