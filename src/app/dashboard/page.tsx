import { useContext, useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { LogOut, Menu, Search, Send, UserPlus, Users, X } from 'lucide-react'
import UserContext from '@/src/contexts/user-context'
import { useNavigate } from 'react-router'
import { server } from '@/src/constants'
import { toast } from '@/src/hooks/use-toast'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/src/components/ui/dialog'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/src/components/ui/input'
import { Conversation, Message, User } from '@/src/types'
import { formatDate, getConversationName } from '@/src/lib/utils'

export default function Dashboard() {
	const navigate = useNavigate()
	const { user, isUserLoading } = useContext(UserContext)

	const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false)
	const [isNewGroupDialogOpen, setIsNewGroupDialogOpen] = useState(false)

	const [username, setUsername] = useState('')

	const [inputUsers, setInputUsers] = useState<User[]>([])
	const [usernameExists, setUsernameExists] = useState<boolean | null>(null)

	const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	const [conversations, setConversations] = useState<Conversation[]>([])
	const [messages, setMessages] = useState<Message[]>([])
	const [currentMessage, setCurrentMessage] = useState('')

	const checkUsername = async (username: string, isAppended: boolean) => {
		//TODO Remove the 5 lines below from each DB call
		if (isUserLoading) return
		if (!user) {
			navigate('/login')
			return
		}
		if (user.username === username) {
			setUsernameExists(null)
			toast({
				variant: 'destructive',
				title: 'Cannot create a conversation with yourself',
			})
			return
		}
		if (inputUsers.some(iu => iu.username === username)) {
			setUsernameExists(true)
			return
		}
		const res = await fetch(`${server}/api/v1/users/${username}`)
		const data = (await res.json()) as User
		if (data.username === username) {
			// Server should return a valid User object in the body
			setUsernameExists(true)
			if (isAppended) {
				setInputUsers([...inputUsers, data])
				setUsername('')
			} else setInputUsers([data])
		} else {
			setUsernameExists(false)
		}
	}

	const createConversation = async (users: User[]) => {
		if (isUserLoading) return
		if (!user) {
			navigate('/login')
			return
		}
		//? Prevent duplicate one-to-one conversation
		if (users.length === 1) {
			const matchingConversation = conversations.find(
				c => c.users.length === 2 && c.users.some(u => u.user_id === users[0].user_id),
			)
			if (matchingConversation !== undefined) {
				toast({
					title: 'Conversation found!',
					description: 'This conversation already exists',
					variant: 'success',
				})
				setIsNewChatDialogOpen(false)
				setIsNewGroupDialogOpen(false)
				if (selectedConversation === matchingConversation) return
				setSelectedConversation(matchingConversation)
				await fetchMessages(matchingConversation.conversation_id)
				return
			}
		}
		const res = await fetch(`${server}/api/v1/conversations`, {
			method: 'POST',
			body: JSON.stringify({ users: [...users, user] }),
			headers: {
				'Content-Type': 'application/json',
			},
		})
		const data = await res.json()
		if (!res.ok) {
			toast({
				title: 'Could not create the new chat',
				description: data.error,
				variant: 'destructive',
			})
			return
		}
		setIsNewChatDialogOpen(false)
		setIsNewGroupDialogOpen(false)
		const newConversation: Conversation = {
			...data,
			lastMessage: data.lastMessage
				? { ...data.lastMessage, sent_at: new Date(data.lastMessage.sent_at) }
				: null,
		}
		setConversations([...conversations, newConversation])
		setSelectedConversation(newConversation)
		setMessages([])
	}

	const getAllConversations = async () => {
		if (isUserLoading) return
		if (!user) {
			navigate('/login')
			return
		}
		const res = await fetch(`${server}/api/v1/users/${user.user_id}/conversations`)
		const data = await res.json()
		if (!res.ok) {
			toast({
				title: 'Something went wrong when fetching the data',
				description: data.error,
				variant: 'destructive',
			})
			return
		}
		setConversations(
			data.map((c: Conversation) => ({
				...c,
				lastMessage: c.lastMessage
					? { ...c.lastMessage, sent_at: new Date(c.lastMessage.sent_at) }
					: null,
			})),
		)
	}

	const createMessage = async (content: string) => {
		if (isUserLoading || selectedConversation === null) return
		if (!user) {
			navigate('/login')
			return
		}
		const res = await fetch(
			`${server}/api/v1/conversations/${selectedConversation.conversation_id}`,
			{
				method: 'POST',
				body: JSON.stringify({
					content,
					author_id: user.user_id,
				}),
				headers: {
					'Content-Type': 'application/json',
				},
			},
		)
		const data = await res.json()
		if (!res.ok) {
			toast({
				title: 'Could not send the message',
				description: data.error,
				variant: 'destructive',
			})
			return
		}
		setMessages([...messages, { ...data, sent_at: new Date(data.sent_at) }])
	}

	const fetchMessages = async (conversation_id: number) => {
		if (isUserLoading) return
		if (!user) {
			navigate('/login')
			return
		}
		const res = await fetch(`${server}/api/v1/conversations/${conversation_id}/messages`)
		const data = await res.json()
		if (!res.ok) {
			toast({
				title: 'Something went wrong when fetching the data',
				description: data.error,
				variant: 'destructive',
			})
			return
		}
		setMessages(
			data.map((message: Message) => ({ ...message, sent_at: new Date(message.sent_at) })),
		)
	}

	const handleLogOut = async () => {
		await fetch(server + '/api/v1/logout', {
			credentials: 'include',
		})
		toast({
			title: 'Successfully logged out',
			description: 'You are no longer logged in',
			variant: 'success',
		})
		navigate('/login')
	}

	useEffect(() => {
		if (!user && !isUserLoading) {
			navigate('/login')
		}
		if (user && !isUserLoading) {
			getAllConversations()
		}
	}, [user, isUserLoading])

	useEffect(() => {
		if (!isNewChatDialogOpen && !isNewGroupDialogOpen) {
			console.log('TEST')
			setUsername('')
			setInputUsers([])
			setUsernameExists(null)
		}
	}, [isNewChatDialogOpen, isNewGroupDialogOpen])

	return (
		<div className="flex h-screen bg-dark-navy relative overflow-hidden">
			{/* Mobile menu button */}
			<Button
				variant="ghost"
				size="icon"
				className="lg:hidden absolute top-3 left-3 z-50 text-gray-400 hover:text-white cursor-pointer hover:bg-gray-900"
				onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
				{isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
			</Button>

			{/* Sidebar */}
			<div
				className={`${
					isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
				} lg:translate-x-0 w-80 border-r border-gray-800 absolute lg:relative inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out bg-dark-navy flex flex-col h-screen`}>
				{/* Header */}
				<div className="shrink-0 p-4 py-[10px] border-b border-gray-800 flex items-center justify-end gap-0.5">
					<span className="text-white font-medium">{user?.username}</span>
					<Button
						variant="ghost"
						size="icon"
						className="text-gray-400 hover:text-white cursor-pointer hover:bg-gray-900"
						title="Log out"
						onClick={handleLogOut}>
						<LogOut className="h-5 w-5" />
					</Button>
				</div>

				{/* New chat dialog */}
				<div className="shrink-0 p-4 flex gap-2">
					<Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
						<DialogTrigger asChild>
							<Button className="flex-1 bg-blue-500 hover:bg-blue-600 cursor-pointer">
								<UserPlus className="h-4 w-4 mr-2" />
								New Chat
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
							<DialogHeader>
								<DialogTitle>Who do you want to chat with?</DialogTitle>
								<DialogDescription className="text-gray-400">
									Enter the username of the person.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="personal-chat-username-input" className="text-right">
										Username
									</Label>
									<div className="col-span-3 flex items-center">
										<Input
											id="personal-chat-username-input"
											value={username}
											onChange={e => setUsername(e.target.value)}
											maxLength={30}
											className="flex-grow bg-gray-800 border-gray-700"
										/>
										<Button
											type="button"
											size="icon"
											variant="ghost"
											onClick={() => checkUsername(username, false)}
											className="ml-2 hover:bg-gray-800 cursor-pointer">
											<Search className="h-4 w-4 text-white" />
										</Button>
									</div>
								</div>
								{usernameExists !== null && (
									<div
										className={`text-xs p-2 rounded ${
											usernameExists ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
										}`}>
										{usernameExists ? 'Username exists!' : 'Invalid username'}
									</div>
								)}
							</div>
							<DialogFooter>
								<Button
									type="button"
									disabled={usernameExists === null || !usernameExists}
									onClick={() => createConversation(inputUsers)}
									className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
									Start chatting
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					{/* New group dialog */}
					<Dialog open={isNewGroupDialogOpen} onOpenChange={setIsNewGroupDialogOpen}>
						<DialogTrigger asChild>
							<Button className="flex-1 bg-blue-500 hover:bg-blue-600 cursor-pointer">
								<Users className="h-4 w-4 mr-2" />
								New Group
							</Button>
						</DialogTrigger>
						<DialogContent className="sm:max-w-[425px] bg-gray-900 text-white border-gray-700">
							<DialogHeader>
								<DialogTitle>Create a new group chat</DialogTitle>
								<DialogDescription className="text-gray-400">
									Add multiple users to one conversation
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-4 py-4">
								{inputUsers.length > 0 && (
									<div className="flex flex-col gap-1 px-2">
										<Label className="text-sm">Added Users:</Label>
										<div className="flex flex-wrap gap-2">
											{inputUsers.map(iu => (
												<div
													key={iu.username}
													className="bg-gray-800 text-white px-2 py-1 rounded-full flex items-center">
													<span>{iu.username}</span>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="h-4 w-4 ml-1 text-gray-400 hover:text-white cursor-pointer"
														onClick={() =>
															setInputUsers(old => {
																const newUsers = [...old]
																newUsers.splice(newUsers.indexOf(iu), 1)
																return newUsers
															})
														}>
														<X className="h-3 w-3" />
													</Button>
												</div>
											))}
										</div>
									</div>
								)}
								<div className="grid grid-cols-4 items-center gap-4">
									<Label htmlFor="personal-chat-username-input" className="text-right">
										Username
									</Label>
									<div className="col-span-3 flex items-center">
										<Input
											id="personal-chat-username-input"
											value={username}
											onChange={e => setUsername(e.target.value)}
											maxLength={30}
											className="flex-grow bg-gray-800 border-gray-700"
										/>
										<Button
											type="button"
											size="icon"
											variant="ghost"
											onClick={() => checkUsername(username, true)}
											className="ml-2 hover:bg-gray-800 cursor-pointer">
											<Search className="h-4 w-4 text-white" />
										</Button>
									</div>
								</div>
								{usernameExists !== null && (
									<div
										className={`text-xs p-2 rounded ${
											usernameExists ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
										}`}>
										{usernameExists ? 'Username exists!' : 'Invalid username'}
									</div>
								)}
							</div>
							<DialogFooter>
								<Button
									type="button"
									disabled={inputUsers.length < 2}
									onClick={() => createConversation(inputUsers)}
									className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
									Create group
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>

				{/* Conversations list */}
				<div className="flex-1 overflow-y-auto">
					{conversations.map(conversation => (
						<div
							key={conversation.conversation_id}
							onClick={() => {
								if (selectedConversation === conversation) return
								setMessages([])
								setSelectedConversation(conversation)
								conversation.newMessages = 0
								setIsSidebarOpen(false) // Close sidebar on mobile after selection
								setCurrentMessage('')
								fetchMessages(conversation.conversation_id)
							}}
							className={`p-4 cursor-pointer hover:bg-gray-800/50 ${
								selectedConversation === conversation ? 'bg-gray-800/50' : ''
							}`}>
							<div className="flex items-center gap-3">
								<div className="flex-1 min-w-0">
									<div className="flex justify-between items-baseline">
										<p className="text-white font-medium truncate">
											{getConversationName(conversation.users, user!)}
										</p>
										<span className="text-xs text-gray-400">
											{conversation.lastMessage ? formatDate(conversation.lastMessage.sent_at) : ''}
										</span>
									</div>
									<div className="flex justify-between items-baseline">
										<p className="text-sm text-gray-400 truncate">
											{conversation.lastMessage
												? conversation.lastMessage.content
												: 'New conversation'}
										</p>
										{conversation.newMessages > 0 && (
											<div className="text-xs bg-red-400 font-bold rounded-full px-2 py-1 text-white w-4 h-4 flex items-center justify-center ml-2">
												{conversation.newMessages}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Overlay for mobile */}
			{isSidebarOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-transparent backdrop-blur-xs transition-all duration-300 ease-in-out bg-opacity-50 z-30"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Chat area - now with responsive padding */}
			{selectedConversation ? (
				<div className="flex-1 flex flex-col">
					{/* Chat header with adjusted padding for mobile */}
					<div className="p-4 pl-16 lg:pl-4 border-b border-gray-800 flex items-center gap-3">
						<span className="text-white font-medium">
							{getConversationName(selectedConversation.users, user!)}
						</span>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-4">
						{messages.map(message => (
							<div
								key={message.message_id}
								className={`flex ${
									message.author_id === user?.user_id ? 'justify-end' : 'justify-start'
								}`}>
								<div
									className={`max-w-[70%] rounded-lg px-4 py-2 ${
										message.author_id === user?.user_id
											? 'bg-messenger-blue text-white'
											: 'bg-gray-800 text-white'
									}`}>
									<div className="flex justify-between items-baseline gap-4">
										<span className="font-medium text-sm">
											{message.author_id === user?.user_id
												? 'You'
												: selectedConversation.users.find(u => u.user_id === message.author_id)
														?.username ?? 'Other user'}
										</span>
										<span className="text-xs opacity-70">{formatDate(message.sent_at)}</span>
									</div>
									<p className="mt-1">{message.content}</p>
								</div>
							</div>
						))}
					</div>

					{/* Message input */}
					<div className="p-4 border-t border-gray-800">
						<form
							className="flex gap-2 items-center"
							onSubmit={e => {
								e.preventDefault()
								createMessage(currentMessage)
								setCurrentMessage('')
							}}>
							<input
								type="text"
								placeholder="Type a message..."
								value={currentMessage}
								onChange={e => setCurrentMessage(e.target.value)}
								className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
								required
							/>
							<Button type="submit" className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
								Send
							</Button>
						</form>
					</div>
				</div>
			) : (
				<div className="flex flex-1 gap-4 items-center justify-center text-dark-navy pointer-events-none select-none">
					<Send className="h-[10vw] w-[10vw] drop-shadow-[2px_2px_0px_rgba(21,156,183,1)]" />
					<p className="text-[10vw] font-medium drop-shadow-[2px_2px_0px_rgba(21,156,183,1)]">
						Messenger
					</p>
				</div>
			)}
		</div>
	)
}
