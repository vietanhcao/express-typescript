import { NextFunction, Response, Router } from "express"
import { Controller } from "utils/base-type"
import postModel from "../posts/posts.model"
import authMiddleware from "../middleware/auth.middleware"
import RequestWithUser from "../interface/requestWithUser.interface"
import NotAuthorizedException from "../exceptions/NotAuthorizedException"
import userModel from "./user.model"
import UserNotFoundException from "../exceptions/UserNotFoundException"

class UserController implements Controller {
  public path = "/users"
  public router = Router()
  private post = postModel
  private user = userModel

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id/posts`, authMiddleware(), this.getAllPostsOfUser)
    this.router.get(`${this.path}/:id`, authMiddleware(), this.getUserById)
  }

  private getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const userId = request.params.id
    if (userId === request.user._id.toString()) {
      const posts = await this.post.find({ author: userId })
      response.json(posts)
    }
    next(new NotAuthorizedException())
  }
  private getUserById = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const id = request.params.id
    const userQuery = this.user.findById(id).lean() // don’t perform the hydration,
    if (request.query.withPosts === "true") {
      userQuery.populate("posts")
    }
    const user = await userQuery
    if (user) {
      response.json(user)
    } else {
      next(new UserNotFoundException(id))
    }
  }
}
export default UserController
