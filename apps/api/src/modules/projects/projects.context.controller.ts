import { Body, Controller, Get, Param, Put, BadRequestException, Inject } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { PostgresActionLogger } from "../../runtime/postgres-action-logger";
import type { ProjectPhase } from "@shared/types/project-phase";

@Controller("projects")
export class ProjectsContextController {
  constructor(
    private readonly projects: ProjectsService,
    @Inject(PostgresActionLogger) private readonly logger: PostgresActionLogger
  ) {}

  @Get(":projectId/context")
  async getContext(@Param("projectId") projectId: string) {
    if (!projectId || projectId.trim().length === 0) {
      throw new BadRequestException("projectId is required");
    }

    return this.projects.getContext(projectId.trim());
  }

  @Put(":projectId/phase")
  async updatePhase(
    @Param("projectId") projectId: string,
    @Body() body: { phase: ProjectPhase }
  ) {
    if (!projectId || projectId.trim().length === 0) {
      throw new BadRequestException("projectId is required");
    }

    if (!body.phase) {
      throw new BadRequestException("phase is required");
    }

    const validPhases: ProjectPhase[] = ["discovery", "design", "delivery", "review"];
    if (!validPhases.includes(body.phase)) {
      throw new BadRequestException(`phase must be one of: ${validPhases.join(", ")}`);
    }

    // For MVP: use "system" as agentId/userId if not available from context
    // In production, this should come from auth context
    const agentId = "system";
    const userId = "system";

    await this.projects.updatePhase(projectId.trim(), body.phase, this.logger, agentId, userId);
    return { ok: true, projectId: projectId.trim(), phase: body.phase };
  }
}

