const jwt = require('jsonwebtoken')
const { getUserById } = require('./db')
const { createHash } = require('crypto')

const authUser = async (req, res, next) => {
	const token = req.cookies.messenger_jwt

	if (!token) {
		res.status(401).json({ error: 'No token specified' })
		return
	}

	try {
		jwt.verify(token, process.env.JWT_SECRET)
		next()
	} catch (err) {
		res.status(401).json({ error: err.message })
	}
}

const getCurrentUser = async (req, res) => {
	const token = req.cookies.messenger_jwt
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const user = await getUserById(decoded.user_id)
		res.status(200).json(user)
	} catch (err) {
		res.status(401).json({ error: err.message })
	}
}

const generateToken = payload => {
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
}

const getEncryptedPassword = (unencrypted, username) => {
	const hashed = createHash('sha256').update(unencrypted).digest('base64')
	return createHash('sha256').update(hashed).update(username).digest('base64')
}

module.exports = { authUser, getCurrentUser, generateToken, getEncryptedPassword }
