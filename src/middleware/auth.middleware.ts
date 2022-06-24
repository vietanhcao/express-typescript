import { NextFunction, RequestHandler, Response } from "express";
import RequestWithUser from "../interface/requestWithUser.interface";
import * as jwt from "jsonwebtoken";
import { DataStoredInToken } from "../authentication/token.types";
import userModel from "../users/user.model";
import WrongAuthenticationTokenException from "../exceptions/WrongAuthenticationTokenException";

function authMiddleware(omitSecondFactor = false): RequestHandler {
  return async (request: RequestWithUser, response: Response, next: NextFunction) => {
    const cookie = request.cookies;
    if (cookie && cookie.Authorization) {
      const secret = process.env.JWT_SECRET;
      try {
        const verificationResponse = jwt.verify(cookie.Authorization, secret) as DataStoredInToken;
        const { _id: id, isSecondFactorAuthenticated } = verificationResponse;
        const user = await userModel.findById(id);
        if (user) {
          if (!omitSecondFactor && user.isTwoFactorAuthenticationEnabled && !isSecondFactorAuthenticated) {
            next(new WrongAuthenticationTokenException());
          } else {
            request.user = user;
            next();
          }
        } else {
          next(new WrongAuthenticationTokenException());
        }
      } catch (error) {
        next(new WrongAuthenticationTokenException());
      }
    } else {
      next(new WrongAuthenticationTokenException());
    }
  };
}

export default authMiddleware;
