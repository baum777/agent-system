import type { ActionLogger } from "@agent-runtime/orchestrator/orchestrator";

export type EscalationContext = {
  projectId?: string;
  clientId?: string;
  decisionId?: string;
  toolName?: string;
  autonomyTier?: number;
};

export type EscalationDetails = {
  reason: string;
  details?: Record<string, unknown>;
  context?: EscalationContext;
};

/**
 * Logs an escalation event to action_logs.
 * Escalations indicate governance violations or drift attempts.
 */
export async function logEscalation(
  logger: ActionLogger,
  params: {
    agentId: string;
    userId: string;
    projectId?: string;
    clientId?: string;
    escalation: EscalationDetails;
  }
): Promise<void> {
  await logger.append({
    agentId: params.agentId,
    userId: params.userId,
    projectId: params.projectId,
    clientId: params.clientId,
    action: "escalation",
    input: {
      reason: params.escalation.reason,
      details: params.escalation.details ?? {},
      context: params.escalation.context ?? {},
    },
    output: {
      escalated: true,
      timestamp: new Date().toISOString(),
    },
    ts: new Date().toISOString(),
    blocked: true,
    reason: params.escalation.reason,
  });
}

