import './env.ts'
import path from 'path'
import { createConversation, createMessage, createUser, getAllConversations, getMessagesInConversation, getUserByUsername, loginUser } from './actions.ts'
import { validateConversation, validateMessage, validateUser } from './validations.ts'
import { authUser, getCurrentUser, invalidateUser } from './auth.ts'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import compression from './compression.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Use Brotli for the js bundle (if supported)
app.use('*.js', compression);

app.use(express.static(path.join(__dirname, '..', '..', 'dist')))

app.post('/api/v1/users', validateUser, createUser)
app.post('/api/v1/login', validateUser, loginUser)
app.get('/api/v1/logout', invalidateUser);
app.get('/api/v1/users/currentUser', authUser, getCurrentUser)
app.get('/api/v1/users/:username', getUserByUsername)
app.post('/api/v1/conversations', validateConversation, createConversation)
app.get('/api/v1/users/:id/conversations', getAllConversations)
app.post('/api/v1/conversations/:id', validateMessage, createMessage)
app.get('/api/v1/conversations/:id/messages', getMessagesInConversation)

app.get('/robots.txt', (_, res) => {
	res.type('text/plain')
	res.send('User-agent: *\nDisallow: /api/*')
})

// Catch-all route for SPA
app.get('/*', (_, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
})

app.listen(3000, () => {
	console.log('Server is running on port 3000')
})
