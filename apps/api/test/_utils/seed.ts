import { Pool } from "pg";

export type SeedTestDbOptions = {
  databaseUrl?: string;
  projectId?: string;
  clientId?: string;
};

export async function seedTestDb(options: SeedTestDbOptions = {}): Promise<{
  projectId: string;
  clientId: string | null;
  created: boolean;
}> {
  const databaseUrl = options.databaseUrl ?? process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to seed the test database");
  }

  const projectId = (options.projectId ?? process.env.TEST_PROJECT_ID ?? "proj_test").trim();
  if (!projectId) {
    throw new Error("TEST_PROJECT_ID must not be empty");
  }

  const rawClientId = options.clientId ?? process.env.TEST_CLIENT_ID ?? "client_test";
  const clientId = rawClientId && rawClientId.trim().length > 0 ? rawClientId.trim() : null;

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      INSERT INTO projects (id, client_id, name, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
      `,
      [projectId, clientId, "Test Project", "Golden Task Seed"]
    );

    await client.query("COMMIT");

    return {
      projectId,
      clientId,
      created: result.rowCount === 1,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

