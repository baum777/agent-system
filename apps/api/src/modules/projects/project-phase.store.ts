import { Injectable } from "@nestjs/common";
import type { ProjectPhase } from "@shared/types/project-phase";

/**
 * In-Memory Project Phase Store (MVP)
 * 
 * Stores project phases in memory.
 * Phase changes must be logged via action_logs.
 * 
 * TODO: In production, consider moving to projects.metadata JSONB field.
 */
@Injectable()
export class ProjectPhaseStore {
  private readonly phases = new Map<string, ProjectPhase>();

  get(projectId: string): ProjectPhase {
    return this.phases.get(projectId) ?? "discovery";
  }

  set(projectId: string, phase: ProjectPhase): void {
    this.phases.set(projectId, phase);
  }

  has(projectId: string): boolean {
    return this.phases.has(projectId);
  }
}

