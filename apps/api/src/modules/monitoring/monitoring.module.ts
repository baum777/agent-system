import { Module } from "@nestjs/common";
import { DbModule } from "../../db/db.module";
import { MonitoringController } from "./monitoring.controller";
import { MonitoringService } from "./monitoring.service";

@Module({
  imports: [DbModule],
  controllers: [MonitoringController],
  providers: [MonitoringService],
})
export class MonitoringModule {}

