const jwt = require('jsonwebtoken')
const { doesUserExist } = require('./db')

const handleAuth = async (req, res, next) => {
	const token = req.cookies.token
	const ignoredRoutes = ['/login', '/sign-up', '/api/v1/login', '/api/v1/users']

	if (ignoredRoutes.includes(req.path)) {
		next()
		return
	}

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

module.exports = { handleAuth, generateToken }
