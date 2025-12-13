import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthCoreModule } from "./auth/core/auth-core.module";
import { UserCoreModule } from "./user/core/user-core.module";
import { SlackModule } from "./slack/slack.module";
require("dotenv").config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URL!),
    AuthCoreModule,
    UserCoreModule,
    SlackModule,
  ],
})
export class AppModule {}
