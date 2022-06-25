import * as mongoose from "mongoose"
import Post from "./posts.interface"

const postSchema = new mongoose.Schema(
  {
    author: {
      ref: "User",
      type: mongoose.Schema.Types.ObjectId,
    },
    content: String,
    title: String,
  },
  { timestamps: true, toJSON: { virtuals: true } },
)

const postModel = mongoose.model<Post & mongoose.Document>("Post", postSchema)

export default postModel
