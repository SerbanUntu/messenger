import db from './db.ts'
import { generateToken, getEncryptedPassword } from './auth.ts'
import type { Request, Response } from 'express'
import type { DatabaseError } from 'pg'

export const createUser = async (req: Request, res: Response) => {
	try {
		const encryptedPassword = getEncryptedPassword(req.body.password, req.body.username)
		const result = await db.query(
			'INSERT INTO users(username, password, created_at) VALUES ($1, $2, $3) RETURNING user_id, username, created_at',
			[req.body.username, encryptedPassword, new Date()],
		)

		res.status(201).json(result.rows[0])
	} catch (err) {
		// unique_violation error code
		if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
			res.status(409).json({ error: 'Username already exists' })
		} else if (err instanceof Error) {
			console.error('Database error:', err)
			res.status(500).json({ error: err.toString() })
		} else {
			console.error('Unknown error:', err)
			res.status(500).json({ error: err })
		}
	}
}


export const loginUser = async (req: Request, res: Response) => {
	try {
		const encryptedPassword = getEncryptedPassword(req.body.password, req.body.username)
		const result = await db.query('SELECT * FROM users WHERE username = $1 AND password = $2', [
			req.body.username,
			encryptedPassword,
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
			res.status(200).json({ user_id: result.rows[0].user_id, username: result.rows[0].username })
			await db.query('UPDATE users SET last_login = $1 WHERE user_id = $2', [
				new Date(),
				result.rows[0].user_id,
			])
		}
	} catch (err) {
		if (err instanceof Error) {
			console.error('Database error:', err)
			res.status(500).json({ error: err.toString() })
		} else {
			console.error('Unknown error:', err)
			res.status(500).json({ error: err })
		}
	}
}

export const getUserByUsername = async (req: Request, res: Response) => {
	try {
		const result = await db.query('SELECT user_id, username FROM users WHERE username = $1', [req.params.username])

		if (result.rowCount === 0) {
			res.status(404).json({ message: "There is no user with this username" })
		} else {
			res.status(200).json({ ...result.rows[0] })
		}
	} catch (err) {
		if (err instanceof Error) {
			console.error('Database error:', err)
			res.status(500).json({ error: err.toString() })
		} else {
			console.error('Unknown error:', err)
			res.status(500).json({ error: err })
		}
	}
}
