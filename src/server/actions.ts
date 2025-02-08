import db from './db.ts'
import { generateToken, getEncryptedPassword } from './auth.ts'
import type { Request, Response } from 'express'
import type { Conversation, Message, User } from '../types.ts'
import { emitConversation, emitMessage } from './websockets.ts'

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
			generateToken({ user_id: result.rows[0].user_id }, res)
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

		let queryString = "INSERT INTO participants(conversation_id, user_id) VALUES ";
		const paramsArr = [];
		for (let i = 0; i <= users.length - 1; i++) {
			if (i > 0) queryString += ", ";
			queryString += `($${2 * i + 1}, $${2 * i + 2})`
			paramsArr.push(conversation_id, users[i].user_id);
		}
		await db.query(
			queryString,
			paramsArr
		);
		const newConversation: Conversation = { conversation_id, users, newMessages: 0, lastMessage: null }
		res.status(201).json(newConversation)
		emitConversation(users, newConversation)
	} catch (err) {
		handleError(err, res);
	}
}

export const getAllConversations = async (req: Request, res: Response) => {
	try {
		const userId = parseInt(req.params.id);
		const result = await db.query(
			`
			SELECT p1.conversation_id AS conversation_id, u.username AS name, u.user_id AS user_id, m.message_id AS message_id, m.author_id AS author_id, m.sent_at AS sent_at, m.content AS content
			FROM participants p1
			JOIN participants p2 ON p1.conversation_id = p2.conversation_id
			JOIN users u ON p2.user_id = u.user_id
			LEFT JOIN LATERAL (
				SELECT message_id, author_id, sent_at, content
				FROM messages
				WHERE conversation_id = p1.conversation_id
				ORDER BY sent_at DESC
				LIMIT 1
			) m ON true
			WHERE p1.user_id = $1
			ORDER BY m.sent_at DESC NULLS LAST, p1.conversation_id
			`,
			[userId]
		)
		const conversations: Conversation[] = [];

		for (const row of result.rows) {
			if (conversations.length === 0 || row.conversation_id !== conversations.at(-1)!.conversation_id) {
				conversations.push({
					conversation_id: row.conversation_id,
					users: [{ user_id: row.user_id, username: row.name }],
					lastMessage: row.message_id ? {
						message_id: row.message_id,
						conversation_id: row.conversation_id,
						author_id: row.author_id,
						sent_at: new Date(row.sent_at),
						content: row.content
					} : null,
					newMessages: 0
				})
			} else {
				conversations.at(-1)!.users.push({ user_id: row.user_id, username: row.name });
			}
		}

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
		const sentMessage: Message = result.rows[0];
		res.status(201).json(result.rows[0]);
		emitMessage(sentMessage)
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
