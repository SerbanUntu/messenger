const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })

const { createUser } = require('./queries')
const { validateUser } = require('./validations')
const express = require('express')

const app = express()

//app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, '..', '..', 'dist')))

app.use((req, _, next) => {
	console.log(`${req.method} ${req.url}`)
	next()
})

app.post('/api/v1/users', validateUser, createUser)

// Catch-all route for SPA
app.use('/*', (_, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
})

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})
