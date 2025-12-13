import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { CustomJwtService } from "./custom-jwt.service";

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? "dev-jwt-secret-change-me";
}

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: getJwtSecret(),
      signOptions: { expiresIn: "1d" },
    }),
  ],
  providers: [CustomJwtService],
  exports: [CustomJwtService],
})
export class CustomJwtModule {}
