import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

if (!process.env.NODE_ENV) {
	throw new Error('NODE_ENV is not set')
}

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', process.env.NODE_ENV === 'production' ? '.env' : '.env.local') })

const requiredEnvVars = [
	'JWT_SECRET',
	'EXPOSED_SERVER_ADDRESS',
	'CORS_ORIGIN',
	'DB_USER',
	'DB_PASSWORD',
	'DB_HOST',
	'DB_PORT',
	'DB_NAME',
	'DB_SSL'
];

requiredEnvVars.forEach(variable => {
	if (!process.env[variable]) {
		throw new Error(`${variable} is not set`);
	}
});
