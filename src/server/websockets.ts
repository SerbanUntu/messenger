import { Server as HttpServer } from "http";
import { Server as IoServer, Socket } from "socket.io";
import type { Conversation, Message, User } from "../types.ts";
import { getUsersInConversation } from "./db.ts";
import corsOptions from "./cors.ts";

let io: IoServer | null = null;
const sockets: Map<number, Socket> = new Map()

export const initIo = (server: HttpServer) => {
	io = new IoServer(server, { cors: corsOptions });

	io.on('connection', (socket: Socket) => {
		const user_id = parseInt(socket.handshake.query.user_id as string)
		sockets.set(user_id, socket)
		console.log(`User with id ${user_id} connected`)

		socket.on("disconnect", () => {
			const user_id = parseInt(socket.handshake.query.user_id as string)
			sockets.delete(user_id)
			console.log(`User with id ${user_id} disconnected`)
		})
	})
}

export const emitMessage = async (message: Message) => {
	const targets = await getUsersInConversation(message.conversation_id, message.author_id) as { user_id: number }[]
	targets.forEach(u => {
		const socket = sockets.get(u.user_id)
		if (socket) {
			socket.emit('message', message)
			console.log(`Message from user ${message.author_id} received by ${u.user_id}`)
		}
	})
}

export const emitConversation = async (users: User[], conversation: Conversation) => {
	// The author is on the last position in the array of users
	for (let i = 0; i < users.length - 1; i++) {
		const socket = sockets.get(users[i].user_id)
		if (socket) {
			socket.emit('conversation', conversation)
			console.log(`Conversation created by user ${users[users.length - 1].user_id} received by ${users[i].user_id}`)
		}
	}
}
