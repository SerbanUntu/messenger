export type User = {
	user_id: number,
	username: string
}

export type Conversation = {
	conversation_id: number,
	users: User[],
}

export type Message = {
	message_id: number,
	conversation_id: number,
	author_id: number,
	sent_at: Date,
	content: string,
}
