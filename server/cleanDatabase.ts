import { initializeDatabase } from './initDb';

async function runClean() {
  console.log('Mengosongkan semua data dan menyisakan hanya akun Admin...');
  const result = await initializeDatabase(true);
  console.log('Hasil:', result);
  process.exit(result.success ? 0 : 1);
}

runClean();
