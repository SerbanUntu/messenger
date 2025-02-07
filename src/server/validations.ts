import type { Request, Response, NextFunction } from 'express'

export const validateUser = (req: Request, res: Response, next: NextFunction) => {
	const user = req.body;
	if (user === null || user === undefined || Object.keys(user).length === 0) {
		res.status(400).json({ error: "Request must have a body" })
		return
	}

	if (!user.username || typeof user.username !== 'string') {
		res.status(400).json({ error: "Invalid username" });
		return
	}

	if (user.username.length > 30) {
		res.status(400).json({ error: "Username too long" });
		return
	}

	if (!/^[A-Za-z0-9\_]*$/.test(user.username)) {
		res.status(400).json({ error: "Username can only contain letters, numbers and underscores" });
		return
	}

	if (!user.password || typeof user.password !== 'string') {
		res.status(400).json({ error: "Invalid password" });
		return
	}

	next()
}

export const validateConversation = (req: Request, res: Response, next: NextFunction) => {
	const conversation = req.body;
	if (conversation === null || conversation === undefined || Object.keys(conversation).length === 0) {
		res.status(400).json({ error: "Request must have a body" })
		return
	}

	const users = conversation.users;

	if (!Array.isArray(users) || users === null || users === undefined) {
		res.status(400).json({ error: "Invalid users array" })
		return
	}

	if (users.length < 2) {
		res.status(400).json({ error: "A conversation must have at least 2 users" })
		return
	}

	for (const user of users) {
		if (!user.user_id || typeof user.user_id !== 'number') {
			res.status(400).json({ error: "Invalid user provided in array" })
			return
		}
	}

	next()
}

export const validateMessage = (req: Request, res: Response, next: NextFunction) => {
	const message = req.body;
	if (message === null || message === undefined || Object.keys(message).length === 0) {
		res.status(400).json({ error: "Request must have a body" })
		return
	}

	if (!message.content || typeof message.content !== 'string') {
		res.status(400).json({ error: "Invalid content" })
		return
	}

	if (!message.author_id || typeof message.author_id !== 'number') {
		res.status(400).json({ error: "Invalid author id" })
		return
	}

	next()
}
