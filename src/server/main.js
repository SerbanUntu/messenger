const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

const { createUser, loginUser } = require('./actions')
const { validateUser } = require('./validations')
const { authUser, getCurrentUser } = require('./auth')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()

// Enable CORS for requests coming from your client (http://localhost:8080)
app.use(cors({
	origin: 'http://localhost:8080',
	credentials: true, // Only necessary if you intend to send cookies in cross-origin requests.
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req, _, next) => {
	console.log(`${req.method} ${req.url}`)
	next()
})

app.use(express.static(path.join(__dirname, '..', '..', 'dist')))

app.post('/api/v1/users', validateUser, createUser)
app.post('/api/v1/login', validateUser, loginUser)
app.get('/api/v1/users/currentUser', authUser, getCurrentUser)

// Catch-all route for SPA
app.get('/*', (_, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
})

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})
