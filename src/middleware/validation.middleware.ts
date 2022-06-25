import { plainToInstance } from "class-transformer"
import { validate, ValidationError } from "class-validator"
import * as express from "express"
import HttpException from "../exceptions/HttpException"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validationMiddleware<T>(type: any, skipMissingProperties = false): express.RequestHandler {
  return (request: express.Request, response: express.Response, next: express.NextFunction) => {
    validate(plainToInstance(type, request.body), { skipMissingProperties }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(", ")
        next(new HttpException(400, message))
      } else {
        next()
      }
    })
  }
}

export default validationMiddleware
