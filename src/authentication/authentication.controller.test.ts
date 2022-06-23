import CreateUserDto from "../users/user.dto";
import AuthenticationController from "./authentication.controller";
import * as mongoose from "mongoose";
import * as request from "supertest";
import App from "../app";

describe("The AuthenticationController", () => {
  describe("POST /auth/register", () => {
    describe("if the email is not taken", () => {
      it("response should have the Set-Cookie header with the Authorization token", () => {
        const userData: CreateUserDto = {
          firstName: "Smith",
          lastName: "Doe",
          email: "v1ietanh1cao19924@gmail.com",
          password: "strongPassword123",
        };
        process.env.JWT_SECRET = "secret";
        const authenticationController = new AuthenticationController();
        authenticationController.authenticationService.user.findOne = jest.fn().mockReturnValue(Promise.resolve(undefined));
        authenticationController.authenticationService.user.create = jest.fn().mockReturnValue({
          ...userData,
          _id: 0,
        });
        (mongoose as any).connect = jest.fn();
        const app = new App([authenticationController], 5000);
        return request(app.getServer())
          .post(`${authenticationController.path}/register`)
          .send(userData)
          .expect("Set-Cookie", /^Authorization=.+/);
      });
    });
  });
});
