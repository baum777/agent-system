import { Inject, Injectable } from "@nestjs/common";
import { PG_POOL } from "../../db/db.module";
import type { Pool } from "pg";

export type DriftMetrics = {
  reviewRejectionRate: {
    value: number;
    numerator: number;
    denominator: number;
  };
  missingLogIncidents: {
    value: number;
  };
  reworkCount: {
    value: number;
  };
  escalationRate: {
    value: number;
    sample: number;
  };
  decisionCompleteness: {
    value: number;
    sample: number;
  };
};

@Injectable()
export class MonitoringService {
  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async getDriftMetrics(from: string, to: string): Promise<DriftMetrics> {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    // 1. Review rejection rate: rejected / (approved + rejected)
    const reviewStats = await this.pool.query<{
      status: string;
      count: string;
    }>(
      `
      SELECT status, COUNT(*)::text as count
      FROM review_requests
      WHERE created_at >= $1::timestamptz AND created_at <= $2::timestamptz
        AND status IN ('approved', 'rejected')
      GROUP BY status
      `,
      [fromDate.toISOString(), toDate.toISOString()]
    );

    const approvedCount = parseInt(
      reviewStats.rows.find((r) => r.status === "approved")?.count ?? "0",
      10
    );
    const rejectedCount = parseInt(
      reviewStats.rows.find((r) => r.status === "rejected")?.count ?? "0",
      10
    );
    const totalResolved = approvedCount + rejectedCount;
    const rejectionRate = totalResolved > 0 ? rejectedCount / totalResolved : 0;

    // 2. Missing log incidents: decisions finalized without "finalized" action log
    const missingLogs = await this.pool.query<{ count: string }>(
      `
      SELECT COUNT(DISTINCT d.id)::text as count
      FROM decisions d
      WHERE d.status = 'final'
        AND d.updated_at >= $1::timestamptz AND d.updated_at <= $2::timestamptz
        AND NOT EXISTS (
          SELECT 1
          FROM action_logs al
          WHERE al.action = 'decision.finalized'
            AND (al.input_json->>'draftId' = d.id OR al.output_json->>'decisionId' = d.id)
        )
      `,
      [fromDate.toISOString(), toDate.toISOString()]
    );
    const missingLogIncidents = parseInt(missingLogs.rows[0]?.count ?? "0", 10);

    // 3. Rework count: review_actions with action='reject' (no 'rework' action exists in schema)
    const reworkStats = await this.pool.query<{ count: string }>(
      `
      SELECT COUNT(*)::text as count
      FROM review_actions ra
      INNER JOIN review_requests rr ON ra.review_id = rr.id
      WHERE ra.action = 'reject'
        AND rr.created_at >= $1::timestamptz AND rr.created_at <= $2::timestamptz
      `,
      [fromDate.toISOString(), toDate.toISOString()]
    );
    const reworkCount = parseInt(reworkStats.rows[0]?.count ?? "0", 10);

    // 4. Escalation rate: count escalation events
    const escalationStats = await this.pool.query<{ count: string }>(
      `
      SELECT COUNT(*)::text as count
      FROM action_logs
      WHERE action = 'escalation'
        AND created_at >= $1::timestamptz AND created_at <= $2::timestamptz
      `,
      [fromDate.toISOString(), toDate.toISOString()]
    );
    const escalationCount = parseInt(escalationStats.rows[0]?.count ?? "0", 10);
    const escalationRate = {
      value: escalationCount,
      sample: escalationCount,
    };

    // 5. Decision completeness: percentage with minimum required fields
    const completenessStats = await this.pool.query<{
      total: string;
      complete: string;
    }>(
      `
      WITH decision_fields AS (
        SELECT
          id,
          status,
          CASE
            WHEN jsonb_array_length(COALESCE(assumptions, '[]'::jsonb)) >= 1
              AND jsonb_array_length(COALESCE(alternatives, '[]'::jsonb)) >= 1
              AND jsonb_array_length(COALESCE(risks, '[]'::jsonb)) >= 1
              AND jsonb_array_length(COALESCE(success_criteria, '[]'::jsonb)) >= 1
              AND jsonb_array_length(COALESCE(next_steps, '[]'::jsonb)) >= 1
            THEN 1
            ELSE 0
          END as is_complete
        FROM decisions
        WHERE created_at >= $1::timestamptz AND created_at <= $2::timestamptz
      )
      SELECT
        COUNT(*)::text as total,
        SUM(is_complete)::text as complete
      FROM decision_fields
      `,
      [fromDate.toISOString(), toDate.toISOString()]
    );

    const totalDecisions = parseInt(completenessStats.rows[0]?.total ?? "0", 10);
    const completeDecisions = parseInt(completenessStats.rows[0]?.complete ?? "0", 10);
    const completenessScore = totalDecisions > 0 ? completeDecisions / totalDecisions : 0;

    return {
      reviewRejectionRate: {
        value: rejectionRate,
        numerator: rejectedCount,
        denominator: totalResolved,
      },
      missingLogIncidents: {
        value: missingLogIncidents,
      },
      reworkCount: {
        value: reworkCount,
      },
      escalationRate,
      decisionCompleteness: {
        value: completenessScore,
        sample: totalDecisions,
      },
    };
  }
}

