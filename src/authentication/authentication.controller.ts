import { NextFunction, Request, Response, Router } from "express";
import { Controller } from "../utils/base-type";
import validationMiddleware from "../middleware/validation.middleware";
import CreateUserDto from "../users/user.dto";
import userModel from "./../users/user.model";
import AuthenticationService from "./authentication.service";
import LoginDto from "./login.dto";
import authMiddleware from "../middleware/auth.middleware";
import RequestWithUser from "../interface/requestWithUser.interface";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";
import TwoFactorAuthenticationDto from "./twoFactorAuthentication.dto";

class AuthenticationController implements Controller {
  public path = "/auth";
  public router = Router();
  private user = userModel;
  public authenticationService = new AuthenticationService();

  constructor() {
    this.intializeRoutes();
  }

  public intializeRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.post(`${this.path}/loign`, validationMiddleware(LoginDto), this.loggingIn);
    this.router.post(`${this.path}/logout`, this.loggingOut);
    this.router.post(`${this.path}/2fa/generate`, authMiddleware(), this.generateTwoFatorAuthenticationCode);
    this.router.post(
      `${this.path}/2fa/turn-on`,
      validationMiddleware(TwoFactorAuthenticationDto),
      authMiddleware(),
      this.turnOnTwoFactorAuthentication,
    );
    this.router.post(
      `${this.path}/2fa/authenticate`,
      validationMiddleware(TwoFactorAuthenticationDto),
      authMiddleware(true),
      this.secondFactorAuthentication,
    );
  }

  private secondFactorAuthentication = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const { twoFactorAuthenticationCode } = request.body;
    const user = request.user;
    const isCodeValid = this.authenticationService.verifyTwoFactorAuthenticationCode(twoFactorAuthenticationCode, user);
    if (isCodeValid) {
      const tokenData = this.authenticationService.createToken(user, true);
      response.setHeader("Set-Cookie", [this.authenticationService.createCookie(tokenData)]);
      response.send({ ...user.toObject(), password: undefined, twoFactorAuthenticationCode: undefined });
    } else {
      next(new WrongAuthenticationTokenException());
    }
  };

  private generateTwoFatorAuthenticationCode = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const user = request.user;
    const { otpauthUrl, base32 } = this.authenticationService.getTwoFactorAuthenticationCode(user.email);
    await this.user.findByIdAndUpdate(
      user._id,
      { twoFactorAuthenticationCode: base32 },
      {
        new: true,
      },
    );
    this.authenticationService.respondWithQRCode(otpauthUrl, response);
  };

  private turnOnTwoFactorAuthentication = async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const { twoFactorAuthenticationCode } = request.body;
    const isCodeValid = this.authenticationService.verifyTwoFactorAuthenticationCode(twoFactorAuthenticationCode, request.user);
    if (isCodeValid) {
      await this.user.findByIdAndUpdate(
        request.user._id,
        { isTwoFactorAuthenticationEnabled: true },
        {
          new: true,
        },
      );
      response.sendStatus(200);
    } else {
      next(new WrongAuthenticationTokenException());
    }
  };

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
      const { user, cookie, isTwoFactorAuthenticationEnabled } = await this.authenticationService.loggingIn(userData);
      response.setHeader("Set-Cookie", [cookie]);
      if (isTwoFactorAuthenticationEnabled) {
        response.send({ isTwoFactorAuthenticationEnabled: true });
      } else {
        response.send(user);
      }
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
