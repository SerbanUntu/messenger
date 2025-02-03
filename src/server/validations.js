const validateUser = (req, res, next) => {
	const user = req.body;
	if (user === null || user === undefined || Object.keys(user).length === 0) {
		res.status(400).json({ error: "Must specify a user" })
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

	if (!user.password || typeof user.password !== 'string') {
		res.status(400).json({ error: "Invalid password" });
		return
	}

	next()
}

module.exports = { validateUser }
