import jwt from 'jsonwebtoken'
import { getUserById } from './db.ts'
import { createHash } from 'crypto'
import type { Request, Response, NextFunction } from 'express'

export const authUser = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.messenger_jwt

	if (!token) {
		res.status(401).json({ error: 'No token specified' })
		return
	}

	try {
		jwt.verify(token, process.env.JWT_SECRET!)
		next()
	} catch (err) {
		res.status(401).json({ error: (err as Error).message })
	}
}

export const getCurrentUser = async (req: Request, res: Response) => {
	const token = req.cookies.messenger_jwt
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { user_id: number };
		const user = await getUserById(decoded.user_id)
		res.status(200).json(user)
	} catch (err) {
		res.status(401).json({ error: (err as Error).message })
	}
}

export const invalidateUser = (_: Request, res: Response) => {
	res.clearCookie('messenger_jwt')
	res.status(200).json({ message: 'Cookie has been cleared' });
}

export const generateToken = (payload: { user_id: number }, res: Response) => {
	if (!process.env.JWT_SECRET) {
		throw new Error('JWT_SECRET environment variable is not set')
	}
	const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
	res.cookie('messenger_jwt', token, {
		httpOnly: true,
		sameSite: 'strict',
		maxAge: 30 * 24 * 60 * 60 * 1000,
	})
}

export const getEncryptedPassword = (unencrypted: string, username: string) => {
	const hashed = createHash('sha256').update(unencrypted).digest('base64')
	return createHash('sha256').update(hashed).update(username).digest('base64')
}
