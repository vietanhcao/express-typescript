import * as express from "express";
import Post from "./posts.interface";
import postModel from "./posts.model";
import PostNotFoundException from "../exceptions/PostNotFoundException";
import validationMiddleware from "../middleware/validation.middleware";
import CreatePostDto from "./posts.dto";

class PostsController {
  public path = "/posts";
  public router = express.Router();

  private posts: Post[] = [
    {
      author: "Marcin",
      content: "Dolor sit amet",
      title: "Lorem Ipsum",
    },
  ];

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.post(this.path, validationMiddleware(CreatePostDto), this.createAPost);
    this.router.get(`${this.path}/:id`, this.getPostById);
    this.router.patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost);
    this.router.delete(`${this.path}/:id`, this.deletePost);
  }
  deletePost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    postModel.findByIdAndDelete(id).then((successResponse) => {
      if (successResponse) {
        response.sendStatus(200);
      } else {
        next(new PostNotFoundException(id));
      }
    });
  };

  modifyPost = (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    const postData: Post = request.body;
    postModel
      .findByIdAndUpdate(id, postData, {
        new: true,
      })
      .then((post) => {
        if (post) {
          response.send(post);
        } else {
          next(new PostNotFoundException(id));
        }
      });
  };

  getPostById = async (request: express.Request, response: express.Response, next: express.NextFunction) => {
    const id = request.params.id;
    postModel.findById(id).then((post) => {
      if (post) {
        response.send(post);
      } else {
        next(new PostNotFoundException(id));
      }
    });
  };

  getAllPosts = async (request: express.Request, response: express.Response) => {
    // postModel.find().exec();	  it will be return a promise
    postModel.find().then((posts) => {
      response.send(posts);
    });
  };

  createAPost = (request: express.Request, response: express.Response) => {
    const postData: Post = request.body;
    const createdPost = new postModel(postData);
    createdPost.save().then((savedPost) => {
      response.send(savedPost);
    });
  };
}

export default PostsController;
