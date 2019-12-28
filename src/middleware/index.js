const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createPostValidator = (req, res, next) => {
  // Title
  req.check("title", "Title must be provided").notEmpty();
  req
    .check("title", "Number of characters must be between 4 and 150")
    .isLength({
      min: 4,
      max: 150
    });
  // Body
  req.check("body", "Body must be provided").notEmpty();
  req.check("body", "Number of characters is at least 4").isLength({
    min: 4
  });
  // Check for errors
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).send({ error: firstError });
  }

  next();
};

const userValidator = (req, res, next) => {
  req.check("name", "Name is required.").notEmpty();
  req
    .check("password", "Password must be at least 8 characters")
    .isLength({ min: 8 });
  req.check("confirmPassword", "Confirm Password is required.").notEmpty();
  req.check("email", "Email is required.").notEmpty();
  req.check("email", "Invalid Email!").isEmail();
  const errors = req.validationErrors();
  if (errors) {
    const firstError = errors.map(error => error.msg)[0];
    return res.status(400).send({ error: firstError });
  }

  // body("email").custom(async value => {
  //   const user = await User.findOne({ email: value });
  //   try {
  //     throw new Error("E-mail already in use.");
  //   } catch (e) {
  //     const errors = req.validationErrors();
  //     if (errors) {
  //       const firstError = errors.map(error => error.msg)[0];
  //       return res.status(400).send({ error: firstError });
  //     }
  //   }
  // });

  next();
};

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRET_MESSAGE);

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token
    });

    if (!user) throw new Error();

    req.user = user;
    req.token = token;

    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate!" });
  }
};

module.exports = {
  createPostValidator,
  userValidator,
  auth
};
