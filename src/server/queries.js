const { pool } = require('./db')
const { generateToken, getEncryptedPassword } = require('./auth')

const createUser = async (req, res) => {
	try {
		const encryptedPassword = getEncryptedPassword(req.body.password, req.body.username);
		const result = await pool.query(
			'INSERT INTO users(username, password, created_at) VALUES ($1, $2, $3) RETURNING user_id, username, created_at',
			[req.body.username, encryptedPassword, new Date()],
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

const loginUser = async (req, res) => {
	try {
		const encryptedPassword = getEncryptedPassword(req.body.password, req.body.username);
		const result = await pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [
			req.body.username,
			encryptedPassword
		])

		if (result.rows.length === 0) {
			res.status(401).json({ error: 'Invalid username or password' })
		} else {
			const token = generateToken({ user_id: result.rows[0].user_id })
			res.cookie('messenger_jwt', token, {
				httpOnly: true,
				sameSite: 'strict',
				maxAge: 30 * 24 * 60 * 60 * 1000,
			})
			res.status(200).json({ message: 'Logged in successfully' })
			await pool.query('UPDATE users SET last_login = $1 WHERE user_id = $2', [
				new Date(),
				result.rows[0].user_id
			])
		}
	} catch (error) {
		console.error('Database error:', error)
		res.status(500).json({ error: error.toString() })
	}
}

module.exports = { createUser, loginUser }
