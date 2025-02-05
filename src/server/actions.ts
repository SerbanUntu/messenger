import db from './db.ts'
import { generateToken, getEncryptedPassword } from './auth.ts'
import type { Request, Response } from 'express'
import type { Conversation, Message, User } from '../types.ts'

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
		} else {
			handleError(err, res);
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
		handleError(err, res);
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
		handleError(err, res);
	}
}

export const createConversation = async (req: Request, res: Response) => {
	try {
		const users: User[] = req.body.users;
		const result = await db.query(
			'INSERT INTO conversations(created_at) VALUES ($1) RETURNING conversation_id, created_at',
			[new Date()]
		)
		const conversation_id = result.rows[0].conversation_id;
		//TODO Refactor this to use one single query
		//TODO Return created conversation
		for (const user of users) {
			await db.query(
				'INSERT INTO participants(conversation_id, user_id) VALUES ($1, $2)',
				[conversation_id, user.user_id]
			)
		}
	} catch (err) {
		handleError(err, res);
	}
}

export const getAllConversations = async (req: Request, res: Response) => {
	try {
		const userId = parseInt(req.params.id);
		const result = await db.query(
			`
			SELECT p1.conversation_id AS conversation_id, u.username AS name
			FROM participants p1
			JOIN participants p2 ON p1.conversation_id = p2.conversation_id
			JOIN users u ON p2.user_id = u.user_id
			WHERE p1.user_id = $1 AND p2.user_id <> $1
			ORDER BY p1.conversation_id
			`,
			[userId]
		)
		const conversationsMap: { [key: number]: string | number } = {};

		for (const row of result.rows) {
			if (!conversationsMap[row.conversation_id]) {
				conversationsMap[row.conversation_id] = row.name as string;
			} else {
				if (typeof conversationsMap[row.conversation] === 'string') {
					conversationsMap[row.conversation_id] = 3;
				} else {
					conversationsMap[row.conversation_id] = (conversationsMap[row.conversation_id] as number) + 1;
				}
			}
		}

		const conversations: Conversation[] = [];
		Object.entries(conversationsMap).forEach(([k, v]) => {
			let name: string;
			if (typeof v === "number") {
				name = `Group of ${v}`
			} else {
				name = v;
			}
			conversations.push({
				conversation_id: parseInt(k),
				name
			})
		})

		res.status(200).json(conversations);

	} catch (err) {
		handleError(err, res);
	}
}

export const createMessage = async (req: Request, res: Response) => {
	try {
		const conversation_id = parseInt(req.params.id);
		const message = req.body;
		const result = await db.query(
			'INSERT INTO messages(conversation_id, author_id, sent_at, content) VALUES ($1, $2, $3, $4) RETURNING message_id, conversation_id, author_id, sent_at, content',
			[conversation_id, message.author_id, new Date(), message.content]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		handleError(err, res);
	}
}

export const getMessagesInConversation = async (req: Request, res: Response) => {
	try {
		const conversation_id = parseInt(req.params.id);
		const result = await db.query(
			'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY sent_at',
			[conversation_id]
		);
		res.status(200).json(result.rows);
	} catch (err) {
		handleError(err, res);
	}
}

const handleError = (err: unknown, res: Response) => {
	if (err instanceof Error) {

		console.error('Database error:', err)
		res.status(500).json({ error: err.toString() })
	} else {
		console.error('Unknown error:', err)
		res.status(500).json({ error: err })
	}
}