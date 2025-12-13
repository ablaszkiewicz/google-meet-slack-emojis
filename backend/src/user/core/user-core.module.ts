import { Module } from "@nestjs/common";
import { UserCoreController } from "./user-core.controller";
import { UserReadModule } from "../read/user-read.module";
import { UserWriteModule } from "../write/user-write.module";

@Module({
  imports: [UserReadModule, UserWriteModule],
  providers: [],
  controllers: [UserCoreController],
})
export class UserCoreModule {}
