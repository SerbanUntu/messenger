import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

import { createUser, loginUser } from './actions.ts'
import { validateUser } from './validations.ts'
import { authUser, getCurrentUser, invalidateUser } from './auth.ts'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

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
app.get('/api/v1/logout', invalidateUser);
app.get('/api/v1/users/currentUser', authUser, getCurrentUser)

// Catch-all route for SPA
app.get('/*', (_, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
})

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})
