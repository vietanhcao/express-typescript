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

class AuthenticationController implements Controller {
  public path = "/auth";
  public router = Router();
  private user = userModel;

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
    if (await this.user.findOne({ email: userData.email })) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email));
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({ ...userData, password: hashedPassword });
      user.password = undefined;
      const tokenData = this.createToken(user);
      response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
      response.send(user);
    }
  };

  private loggingIn = async (request: Request, response: Response, next: NextFunction) => {
    const userData: LoginDto = request.body;
    const user = await this.user.findOne({ email: userData.email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(userData.password, user.password);
      if (isPasswordValid) {
        user.password = undefined;
        const tokenData = this.createToken(user);
        response.setHeader("Set-Cookie", [this.createCookie(tokenData)]);
        response.send(user);
      } else {
        next(new WrongCredentialsException());
      }
    } else {
      next(new WrongCredentialsException());
    }
  };

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    return { expiresIn, token: jwt.sign(dataStoredInToken, secret, { expiresIn }) };
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  private loggingOut = (request: Request, response: Response) => {
    response.setHeader("Set-Cookie", ["Authorization=;Max-age=0"]);
    response.sendStatus(200);
  };
}

export default AuthenticationController;
