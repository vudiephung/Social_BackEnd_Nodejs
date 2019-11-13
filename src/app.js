const express = require("express");
const app = express();
const morgan = require("morgan");
const postRouter = require("./routes/post");
const userRouter = require("./routes/user");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const expressValidator = require("express-validator");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config();

// Database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Database connected!");
  });

mongoose.connection.on("error", error => {
  console.log("DB connection Error:" + error.message);
});

// Middleware
//app.use(express.json())
app.use(cors());
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(expressValidator());
app.use(postRouter);
app.use(userRouter);

//
const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log("Listening on port " + port);
});
