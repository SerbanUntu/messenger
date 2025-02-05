import pg from 'pg'

const db = new pg.Pool({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || '5432'),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	max: 10,
})

export const getUserById = async (id: number) => {
	const result = await db.query('SELECT user_id, username FROM users WHERE user_id = $1', [id])
	return result.rows[0]
}

export default db
