import { NextFunction, Response, Router, Request } from "express"
import userModel from "../users/user.model"
import { Controller } from "../utils/base-type"

class ReportController implements Controller {
  public path = "/report"
  public router = Router()
  private user = userModel

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.get(this.path, this.generateReport)
    this.router.get(`${this.path}/count`, this.getNumberOfUser)
  }
  private async getNumberOfUser(request: Request, response: Response, next: NextFunction) {
    const numberOfUsersWithAddress = await this.user.countDocuments({
      address: {
        $exists: true,
      },
    })
    const countries = await this.user.distinct("address.country", {
      email: {
        $regex: /@gmail.com$/,
      },
    })

    response.send({ numberOfUsersWithAddress, countries })
  }

  private async generateReport(request: Request, response: Response, next: NextFunction) {
    const usersByCountry = await this.user.aggregate([
      {
        $match: {
          "address.country": { $exists: true },
        },
      },
      {
        $group: {
          _id: { country: "$address.country" },
          usersLu: {
            $push: {
              _id: "$_id",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        // $lookup: {
        //   from: "users",
        //   localField: "usersLu._id",
        //   foreignField: "_id",
        //   as: "usersLu", // just name of the field
        // },
        $lookup: {
          from: "posts",
          localField: "usersLu._id",
          foreignField: "author",
          as: "articles", // just name of the field
        },
      },
      {
        $addFields: { amountOfArticles: { $size: "$articles" } },
      },
      {
        $sort: { amountOfArticles: 1 },
      },
    ])
    response.send({ usersByCountry })
  }
}

export default ReportController
