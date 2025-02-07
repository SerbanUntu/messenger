import { Server as HttpServer } from "http";
import { Server as IoServer, Socket } from "socket.io";
import type { Message } from "../types.ts";
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

export const getIo = (): IoServer => {
	if (!io) throw new Error("Server not initialized")
	return io
}

export const emitMessage = async (message: Message) => {
	const targets = await getUsersInConversation(message.conversation_id, message.author_id) as number[]
	targets.forEach(id => {
		sockets.get(id)?.emit('message', message)
	})
}
