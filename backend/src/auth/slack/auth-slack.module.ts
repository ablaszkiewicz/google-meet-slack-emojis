import { Module } from "@nestjs/common";
import { AuthSlackController } from "./auth-slack.controller";
import { AuthSlackService } from "./auth-slack.service";
import { UserWriteModule } from "../../user/write/user-write.module";
import { CustomJwtModule } from "../custom-jwt/custom-jwt.module";

@Module({
  imports: [UserWriteModule, CustomJwtModule],
  controllers: [AuthSlackController],
  providers: [AuthSlackService],
})
export class AuthSlackModule {}
