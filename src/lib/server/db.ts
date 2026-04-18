import { createClient } from '@libsql/client/http';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

export function getDb(env: { TURSO_DATABASE_URL: string; TURSO_AUTH_TOKEN: string }) {
	const url = env.TURSO_DATABASE_URL.replace(/^libsql:\/\//, 'https://');
	const client = createClient({
		url,
		authToken: env.TURSO_AUTH_TOKEN
	});
	return drizzle(client, { schema });
}
