import { seedTestDb } from "./seed";

async function main() {
  const result = await seedTestDb();
  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        ok: true,
        ...result,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});

