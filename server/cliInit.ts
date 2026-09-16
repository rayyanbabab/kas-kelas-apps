import { initializeDatabase } from './initDb';

async function main() {
  console.log('Running Neon PostgreSQL initialization from CLI...');
  const res = await initializeDatabase(false);
  console.log('Result:', res);
  process.exit(res.success ? 0 : 1);
}

main();
