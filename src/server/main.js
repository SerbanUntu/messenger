const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

const { createUser, loginUser } = require('./queries')
const { validateUser } = require('./validations')
const { handleAuth } = require('./auth')
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()

//app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req, _, next) => {
	console.log(`${req.method} ${req.url}`)
	next()
})

app.use(express.static(path.join(__dirname, '..', '..', 'dist')))

app.use('/app', handleAuth)

app.post('/api/v1/users', validateUser, createUser)
app.post('/api/v1/login', validateUser, loginUser)

// Catch-all route for SPA
app.get('/*', (_, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
})

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})
