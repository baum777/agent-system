import { Controller, Get, Query, BadRequestException, Inject } from "@nestjs/common";
import { KnowledgeService } from "./knowledge.service";
import { PostgresActionLogger } from "../../runtime/postgres-action-logger";

@Controller("knowledge")
export class KnowledgeController {
  constructor(
    private readonly knowledge: KnowledgeService,
    @Inject(PostgresActionLogger) private readonly logger: PostgresActionLogger
  ) {}

  @Get("search")
  async search(
    @Query("projectId") projectId?: string,
    @Query("q") q?: string,
    @Query("sources") sources?: string,
    @Query("limit") limitStr?: string
  ) {
    // Validation: projectId required
    if (!projectId || projectId.trim().length === 0) {
      throw new BadRequestException("projectId is required");
    }

    // Validation: q required, min length 2
    if (!q || q.trim().length < 2) {
      throw new BadRequestException("q is required and must be at least 2 characters");
    }

    // Validation: sources whitelist
    const validSources = ["decisions", "reviews", "logs"];
    const sourcesArray = sources
      ? sources.split(",").map((s) => s.trim()).filter((s) => validSources.includes(s))
      : ["decisions"];

    if (sourcesArray.length === 0) {
      throw new BadRequestException(`sources must be one or more of: ${validSources.join(", ")}`);
    }

    // Validation: limit clamp (default 10, max 25)
    let limit = 10;
    if (limitStr) {
      const parsed = parseInt(limitStr, 10);
      if (isNaN(parsed) || parsed < 1) {
        throw new BadRequestException("limit must be a positive number");
      }
      limit = Math.min(parsed, 25);
    }

    // For MVP: use "system" as agentId/userId if not available from context
    // In production, this should come from auth context
    const agentId = "system";
    const userId = "system";

    return this.knowledge.search(projectId.trim(), q.trim(), sourcesArray, limit, this.logger, agentId, userId);
  }
}

