import { Socket } from "socket.io-client"

export type User = {
	user_id: number,
	username: string
}

export type UserWithSocket = {
	user_id: number,
	username: string,
	socket: Socket
}

export type Conversation = {
	conversation_id: number,
	users: User[],
	lastMessage: Message | null,
	newMessages: number
}

export type Message = {
	message_id: number,
	conversation_id: number,
	author_id: number,
	sent_at: Date,
	content: string,
}
