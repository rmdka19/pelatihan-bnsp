import { createApp } from './app.js';
import { ensureSchema, pool } from './db.js';

const port = Number(process.env.PORT || 3000);

await ensureSchema();

const server = createApp().listen(port, () => {
  console.log(`API Anggota Tim berjalan di http://localhost:${port}`);
});

async function shutdown(signal) {
  console.log(`\n${signal} diterima — menutup server...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

