import * as mongoose from "mongoose"
import User from "./user.interface"

const addressSchema = new mongoose.Schema({
  city: String,
  street: String,
  country: String,
})

const userSchema = new mongoose.Schema(
  {
    address: addressSchema,
    name: String,
    firstName: String,
    lastName: String,
    email: String,
    password: {
      type: String,
      get: (): undefined => undefined,
      // set: (plaintextPassword: string) => {
      //   return createPasswordHash(plaintextPassword);
      // },
    },
    // posts: [
    //   {
    //     ref: "Post",
    //     type: mongoose.Schema.Types.ObjectId,
    //   },
    // ],
    twoFactorAuthenticationCode: String,
    isTwoFactorAuthenticationEnabled: Boolean,
    creditCardNumber: {
      type: String,
      get: (creditCardNumber: string) => {
        return creditCardNumber ? `****-****-****-${creditCardNumber?.slice(creditCardNumber.length - 4)}` : creditCardNumber
      },
    },
  },
  {
    toJSON: {
      getters: true,
      virtuals: true,
    },
  },
)

userSchema.virtual("fullName").get(function () {
  return `${this.email} firstName`
})

userSchema.pre("save", async function () {
  console.log("run here")
  this.name = "ok"
})

userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
})

const userModel = mongoose.model<User & mongoose.Document>("User", userSchema)

export default userModel
