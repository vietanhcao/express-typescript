import * as express from "express"
import * as bodyParser from "body-parser"
import * as mongoose from "mongoose"
import { Controller } from "./utils/base-type"
import errorMiddleware from "./middleware/error.middleware"
import * as cookieParser from "cookie-parser"

class App {
  public app: express.Application
  public port: number

  constructor(controllers: Controller[], port: number) {
    this.app = express()
    this.port = port

    this.connectToTheDataBase()
    this.initializeMiddlewares()
    this.initializeControllers(controllers)
    this.initializeErrorHanding()
  }
  public listen() {
    this.app.listen(this.port, () => {
      console.log(`App listening on the port ${this.port}`)
    })
  }
  public getServer() {
    return this.app
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json())
    this.app.use(cookieParser())
  }

  private initializeErrorHanding() {
    this.app.use(errorMiddleware)
  }

  private initializeControllers(controllers: Controller[]) {
    controllers.forEach((controller) => {
      this.app.use("/", controller.router)
    })
  }

  private connectToTheDataBase() {
    const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_DATABASE, MONGO_HOST } = process.env
    // mongoose.connect(`mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}`, {
    //   dbName: MONGO_DATABASE,
    // })
    mongoose.connect(`mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@cluster0.btc8asi.mongodb.net/${MONGO_DATABASE}?retryWrites=true&w=majority`)
  }
}

export default App
