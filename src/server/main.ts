import './env.ts'
import './websockets.ts'
import path from 'path'
import { createConversation, createMessage, createUser, getAllConversations, getMessagesInConversation, getUserByUsername, loginUser } from './actions.ts'
import { validateConversation, validateMessage, validateUser } from './validations.ts'
import { authUser, getCurrentUser, invalidateUser } from './auth.ts'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import compression from './compression.ts'
import { createServer } from 'http'
import corsOptions from './cors.ts'
import { initIo } from './websockets.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express()
const server = createServer(app);
initIo(server)

app.use(cors(corsOptions))

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
app.get('/api/v1/users/:username', authUser, getUserByUsername)
app.post('/api/v1/conversations', authUser, validateConversation, createConversation)
app.get('/api/v1/users/:id/conversations', authUser, getAllConversations)
app.post('/api/v1/conversations/:id', authUser, validateMessage, createMessage)
app.get('/api/v1/conversations/:id/messages', authUser, getMessagesInConversation)

app.get('/robots.txt', (_, res) => {
	res.type('text/plain')
	res.send('User-agent: *\nDisallow: /api/*')
})

// Catch-all route for SPA
app.get('/*', (_, res) => {
	res.sendFile(path.join(__dirname, '..', '..', 'dist', 'index.html'))
})

server.listen(3000, () => {
	console.log('Server is running on port 3000')
})
