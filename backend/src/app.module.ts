import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthCoreModule } from "./auth/core/auth-core.module";
import { UserCoreModule } from "./user/core/user-core.module";
import { SlackModule } from "./slack/slack.module";
require("dotenv").config();

function getMongoUri(): string {
  const mongoUri = process.env.MONGO_URL ?? process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "Missing Mongo connection string. Set MONGO_URL (or MONGO_URI) in your environment."
    );
  }

  return mongoUri;
}

@Module({
  imports: [
    MongooseModule.forRoot(getMongoUri()),
    AuthCoreModule,
    UserCoreModule,
    SlackModule,
  ],
})
export class AppModule {}
