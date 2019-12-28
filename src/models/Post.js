const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 150,
      unique: true
    },
    body: {
      type: String,
      required: true,
      minlength: 4
    },
    mediaUrl: {
      type: String
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        text: String,
        createdAt: { type: Date, default: Date.now },
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
      }
    ]
  },
  { timestamps: true }
);

postSchema.pre(/^find/, function(next) {
  this.start = Date.now();
  const post = this;
  post.populate("owner", "_id name avatar");
  next();
});

postSchema.post(/^find/, function(docs, next) {
  console.log(`Querry took ${Date.now() - this.start} milliseconds!`);
  next();
});

mongoose.models = {};

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
