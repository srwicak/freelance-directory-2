declare global {
	namespace App {
		interface Platform {
			env: {
				TURSO_DATABASE_URL: string;
				TURSO_AUTH_TOKEN: string;
				ENCRYPTION_KEY: string;
			};
		}
	}
}

export {};
