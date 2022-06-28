import * as express from "express"
import Post from "./posts.interface"
import postModel from "./posts.model"
import PostNotFoundException from "../exceptions/PostNotFoundException"
import validationMiddleware from "../middleware/validation.middleware"
import CreatePostDto from "./posts.dto"
import authMiddleware from "../middleware/auth.middleware"
import RequestWithUser from "../interface/requestWithUser.interface"
import userModel from "../users/user.model"
import { Model } from "mongoose"
import User from "../users/user.interface"

class PostsController {
  public path = "/posts"
  public router = express.Router()
  private user: Model<User>

  constructor() {
    this.intializeRoutes()
    this.user = userModel
  }

  public intializeRoutes() {
    this.router.get(this.path, this.getAllPosts)
    this.router.get(`${this.path}/:id`, this.getPostById)

    this.router
      .all(`${this.path}/*`, authMiddleware())
      .post(this.path, authMiddleware(), validationMiddleware(CreatePostDto), this.createAPost)
      .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost)
      .delete(`${this.path}/:id`, this.deletePost)
  }
  deletePost(request: express.Request, response: express.Response, next: express.NextFunction) {
    const id = request.params.id
    postModel.findByIdAndDelete(id).then((successResponse) => {
      if (successResponse) {
        response.sendStatus(200)
      } else {
        next(new PostNotFoundException(id))
      }
    })
  }

  modifyPost(request: express.Request, response: express.Response, next: express.NextFunction) {
    const id = request.params.id
    const postData: Post = request.body
    postModel
      .findByIdAndUpdate(id, postData, {
        new: true,
      })
      .then((post) => {
        if (post) {
          response.send(post)
        } else {
          next(new PostNotFoundException(id))
        }
      })
  }

  async getPostById(request: express.Request, response: express.Response, next: express.NextFunction) {
    const id = request.params.id
    postModel.findById(id).then((post) => {
      if (post) {
        response.send(post)
      } else {
        next(new PostNotFoundException(id))
      }
    })
  }

  async getAllPosts(request: express.Request, response: express.Response) {
    postModel
      .find()
      // .populate("author", "-password")
      .populate("author")
      .then((posts) => {
        response.send(posts)
      })
  }

  createAPost = async (request: RequestWithUser, response: express.Response) => {
    const postData: Post = request.body
    const createdPost = new postModel({ ...postData, author: request.user._id })

    // manny to manny  to take care of the consistency of the data
    const user = await this.user.findById(request.user._id)
    user.posts = [...user.posts, createdPost._id]
    await user.save()

    const savedPost = await createdPost.save()
    await savedPost.populate("author", "-password -__v")
    response.send(savedPost)
  }
}

export default PostsController
