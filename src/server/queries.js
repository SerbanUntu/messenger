const pg = require('pg')

const pool = new pg.Pool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	max: 10,
})

const createUser = async (req, res) => {
	try {
		const result = await pool.query(
			'INSERT INTO users(username, password, created_at) VALUES ($1, $2, $3) RETURNING user_id, username, created_at',
			[req.body.username, req.body.password, new Date()],
		)

		res.status(201).json(result.rows[0])
	} catch (error) {
		if (error.code === '23505') {
			// unique_violation error code
			res.status(409).json({ error: 'Username already exists' })
		} else {
			console.error('Database error:', error)
			res.status(500).json({ error: error.toString() })
		}
	}
}

module.exports = { createUser }
