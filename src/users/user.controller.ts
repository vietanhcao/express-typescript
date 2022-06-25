import { NextFunction, Response, Router } from "express"
import { Controller } from "utils/base-type"
import postModel from "../posts/posts.model"
import authMiddleware from "../middleware/auth.middleware"
import RequestWithUser from "../interface/requestWithUser.interface"
import NotAuthorizedException from "../exceptions/NotAuthorizedException"

class UserController implements Controller {
  public path = "/users"
  public router = Router()
  private post = postModel

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id/posts`, authMiddleware(), this.getAllPostsOfUser)
  }

  private getAllPostsOfUser = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const userId = request.params.id
    if (userId === request.user._id.toString()) {
      const posts = await this.post.find({ author: userId })
      response.send(posts)
    }
    next(new NotAuthorizedException())
  }
}
export default UserController
