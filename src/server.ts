import App from "./app"
import PostsController from "./posts/posts.controller"
import "dotenv/config"
import validateEnv from "./utils/validateEnv"
import AuthenticationController from "./authentication/authentication.controller"
import UserController from "./users/user.controller"
import ReportController from "./report/repost.controller"

validateEnv()

const app = new App([new AuthenticationController(), new PostsController(), new UserController(), new ReportController()], 5000)

app.listen()
