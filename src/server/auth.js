const jwt = require('jsonwebtoken')
const { doesUserExist } = require('./db')
const { createHash } = require('crypto')

const handleAuth = async (req, res, next) => {
	const token = req.cookies.messenger_jwt

	if (!token) {
		res.status(401).json({ error: 'No token specified' })
		return
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)
		const userExists = await doesUserExist(decoded.user_id)
		if (!userExists) {
			res.status(401).json({ error: 'User does not exist' })
			return
		}
		next()
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

module.exports = { handleAuth, generateToken, getEncryptedPassword }
