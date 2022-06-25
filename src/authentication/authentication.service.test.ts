import AuthenticationService from "./authentication.service"
import { TokenData } from "./token.types"
import CreateUserDto from "../users/user.dto"
import UserWithThatEmailAlreadyExistsException from "../exceptions/UserWithThatEmailAlreadyExistsException"

describe("The AuthenticationService", () => {
  describe("when creating a cookie", () => {
    const tokenData: TokenData = {
      token: "",
      expiresIn: 1,
    }
    it("should return a string", () => {
      const authenticationService = new AuthenticationService()
      expect(typeof authenticationService.createCookie(tokenData)).toEqual("string")
    })
  })
  describe("when registering a user", () => {
    describe("if the email is already taken", () => {
      it("should throw an error", async () => {
        const userData: CreateUserDto = {
          firstName: "Smith",
          lastName: "Doe",
          email: "v1ietanh1cao19924@gmail.com",
          password: "strongPassword123",
        }
        const authenticationService = new AuthenticationService()
        authenticationService.user.findOne = jest.fn().mockReturnValue(Promise.resolve(userData))
        await expect(authenticationService.registration(userData)).rejects.toMatchObject(new UserWithThatEmailAlreadyExistsException(userData.email))
      })
    })

    describe("if the email is not taken", () => {
      it("should throw an error", async () => {
        const userData: CreateUserDto = {
          firstName: "Smith",
          lastName: "Doe",
          email: "v1ietanh1cao19924@gmail.com",
          password: "strongPassword123",
        }
        process.env.JWT_SECRET = "secret"
        const authenticationService = new AuthenticationService()
        authenticationService.user.findOne = jest.fn().mockReturnValue(Promise.resolve(undefined)) // mock data to use in register
        authenticationService.user.create = jest.fn().mockReturnValue({
          ...userData,
          _id: 0,
        })
        await expect(authenticationService.registration(userData)).resolves.toBeDefined()
      })
    })
  })
})
