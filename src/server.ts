import App from "./app";
import PostsController from "./posts/posts.controller";
import "dotenv/config";
import validateEnv from "./utils/validateEnv";
import AuthenticationController from "./authentication/authentication.controller";
import UserController from "./users/user.controller";

validateEnv();

const app = new App([new AuthenticationController(), new PostsController(), new UserController()], 5000);

app.listen();
