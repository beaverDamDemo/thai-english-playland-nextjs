import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value && !process.env[key]) {
        process.env[key] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL env var not set');
    process.exit(1);
  }

  const sqlFile = path.join(__dirname, '..', 'db', 'init', '001_schema.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');

  console.log('Connecting to database...');

  const ssl = url.includes('sslmode=disable') ? false : 'require';

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    console.error('Invalid DATABASE_URL');
    process.exit(1);
  }

  const database = parsedUrl.pathname.replace(/^\//, '');

  const sqlClient = postgres({
    host: parsedUrl.hostname,
    port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 5432,
    database,
    username: parsedUrl.username,
    password: parsedUrl.password,
    ssl,
    prepare: false,
    max: 1,
    connect_timeout: 15,
  });

  try {
    console.log('Running schema SQL...');
    await sqlClient.unsafe(sql);
    console.log('Schema applied successfully!');
  } catch (err) {
    console.error('Error running schema:', err.message);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}

main();
