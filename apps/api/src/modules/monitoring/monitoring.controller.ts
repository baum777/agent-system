import { Controller, Get, Query } from "@nestjs/common";
import { MonitoringService } from "./monitoring.service";

@Controller("monitoring")
export class MonitoringController {
  constructor(private readonly monitoring: MonitoringService) {}

  @Get("drift")
  async getDrift(
    @Query("from") from?: string,
    @Query("to") to?: string
  ): Promise<{
    range: { from: string; to: string };
    metrics: Awaited<ReturnType<MonitoringService["getDriftMetrics"]>>;
  }> {
    // Default: last 30 days
    const toDate = to ? new Date(to) : new Date();
    const fromDate = from
      ? new Date(from)
      : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    const metrics = await this.monitoring.getDriftMetrics(
      fromDate.toISOString(),
      toDate.toISOString()
    );

    return {
      range: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
      metrics,
    };
  }
}

