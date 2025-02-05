import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '.env') })

const requiredEnvVars = [
	'DB_USER',
	'DB_PASSWORD',
	'DB_HOST',
	'DB_PORT',
	'DB_NAME',
	'JWT_SECRET'
];

requiredEnvVars.forEach(variable => {
	if (!process.env[variable]) {
		throw new Error(`${variable} is not set`);
	}
});
