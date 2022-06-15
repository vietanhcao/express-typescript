import { cleanEnv, str } from "envalid";

export default function validateEnv() {
  cleanEnv(process.env, {
    MONGO_USERNAME: str(),
    MONGO_PASSWORD: str(),
    MONGO_DATABASE: str(),
    MONGO_HOST: str(),
  });
}
