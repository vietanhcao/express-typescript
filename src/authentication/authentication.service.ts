import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import userModel from "../users/user.model";
import CreateUserDto from "../users/user.dto";
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException";
import { DataStoredInToken, TokenData } from "./token.types";
import User from "../users/user.interface";
import LoginDto from "./login.dto";
import WrongCredentialsException from "../exceptions/WrongCredentialsException";
import { Response } from "express";

class AuthenticationService {
  public user = userModel;

  public async registration(userData: CreateUserDto) {
    if (await this.user.findOne({ email: userData.email })) {
      throw new UserWithThatEmailAlreadyExistsException(userData.email);
    } else {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await this.user.create({ ...userData, password: hashedPassword });
      user.password = undefined;
      const tokenData = this.createToken(user);
      const cookie = this.createCookie(tokenData);

      return { user, cookie, tokenData };
    }
  }

  public async loggingIn(userData: LoginDto) {
    const user = await this.user.findOne({ email: userData.email });
    if (user) {
      const isPasswordValid = await bcrypt.compare(userData.password, user.password);
      if (isPasswordValid) {
        user.password = undefined;
        const tokenData = this.createToken(user);
        const cookie = this.createCookie(tokenData);
        if (user.isTwoFactorAuthenticationEnabled) {
          return { isTwoFactorAuthenticationEnabled: true, cookie, tokenData };
        } else {
          return { user, cookie, tokenData };
        }
      } else {
        throw new WrongCredentialsException();
      }
    } else {
      throw new WrongCredentialsException();
    }
  }

  public createToken(user: User, isSecondFactorAuthenticated = false): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const dataStoredInToken: DataStoredInToken = { _id: user._id, isSecondFactorAuthenticated };
    return { expiresIn, token: jwt.sign(dataStoredInToken, secret, { expiresIn }) };
  }

  public createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`;
  }

  public getTwoFactorAuthenticationCode(email: string) {
    const secretCode = speakeasy.generateSecret({
      name: `${process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME} ${email}`,
    });
    return {
      otpauthUrl: secretCode.otpauth_url,
      base32: secretCode.base32,
    };
  }

  public respondWithQRCode(data: string, response: Response) {
    QRCode.toFileStream(response, data);
  }

  public verifyTwoFactorAuthenticationCode(twoFactorAuthenticationCode: string, user: User) {
    return speakeasy.totp.verify({
      secret: user.twoFactorAuthenticationCode,
      encoding: "base32",
      token: twoFactorAuthenticationCode,
    });
  }
}

export default AuthenticationService;
