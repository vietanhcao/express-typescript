import * as bcrypt from "bcrypt";
import { Request, Response, NextFunction, Router } from "express";
import { Controller } from "../utils/base-type";
// import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
// import WrongCredentialsException from '../exceptions/WrongCredentialsException';
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "../users/user.dto";
import userModel from "./../users/user.model";
// import LogInDto from "./logIn.dto";
import LoginDto from "./login.dto";
import * as jwt from "jsonwebtoken";
import User from "../users/user.interface";
import { DataStoredInToken, TokenData } from "./token.types";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import AuthenticationService from "./authentication.service";

class AuthenticationController implements Controller {
  public path = "/auth";
  public router = Router();
  private user = userModel;
  private authenticationService = new AuthenticationService();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.post(`${this.path}/loign`, validationMiddleware(LoginDto), this.loggingIn);
    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private registration = async (request: Request, response: Response, next: NextFunction) => {
    const userData: CreateUserDto = request.body;
    try {
      const { user, cookie } = await this.authenticationService.registration(userData);
      response.setHeader("Set-Cookie", [cookie]);
      response.send(user);
    } catch (error) {
      next(error);
    }
  };

  private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
    const userData: LoginDto = request.body;

    try {
      const { user, cookie } = await this.authenticationService.loggingIn(userData);
      response.setHeader("Set-Cookie", [cookie]);
      response.send(user);
    } catch (error) {
      next(error);
    }
  };

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
    response.sendStatus(200);
  };
}

export default AuthenticationController;
