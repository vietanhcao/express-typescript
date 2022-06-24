import { Request } from "express";
import User from "../users/user.interface";
import * as mongoose from "mongoose";

interface RequestWithUser extends Request {
  user: User & mongoose.Document;
}

export default RequestWithUser;
