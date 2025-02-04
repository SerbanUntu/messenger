import { useContext, useEffect, useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { LogOut, Menu, UserPlus, Users, X } from 'lucide-react'
import UserContext from '@/src/contexts/user-context'
import { useNavigate } from 'react-router'
import { server } from '@/src/constants'
import { toast } from '@/src/hooks/use-toast'

export default function Dashboard() {
	const navigate = useNavigate()
	const [selectedChat, setSelectedChat] = useState(0)
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	const { user, isUserLoading } = useContext(UserContext)

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
	}, [user, isUserLoading])

	// Dummy data for demonstration
	const chats = [
		{ id: 0, name: 'alice_smith', lastMessage: 'See you tomorrow!', time: '10:30 AM', unread: 5 },
		{ id: 1, name: 'bob_johnson', lastMessage: 'Thanks for the help!', time: '9:15 AM', unread: 0 },
		{ id: 2, name: 'team_project', lastMessage: 'Meeting at 3 PM', time: 'Yesterday', unread: 2 },
	]

	const messages = [
		{ id: 1, sender: 'alice_smith', content: 'Hi there!', time: '10:25 AM', isSent: false },
		{ id: 2, sender: 'You', content: 'Hello! How are you?', time: '10:28 AM', isSent: true },
		{
			id: 3,
			sender: 'alice_smith',
			content: "I'm good, see you tomorrow!",
			time: '10:30 AM',
			isSent: false,
		},
	]

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

				{/* Action buttons */}
				<div className="shrink-0 p-4 flex gap-2">
					<Button className="flex-1 bg-blue-500 hover:bg-blue-600 cursor-pointer">
						<UserPlus className="h-4 w-4 mr-2" />
						New Chat
					</Button>
					<Button className="flex-1 bg-blue-500 hover:bg-blue-600 cursor-pointer">
						<Users className="h-4 w-4 mr-2" />
						New Group
					</Button>
				</div>

				{/* Chats list */}
				<div className="flex-1 overflow-y-auto">
					{chats.map(chat => (
						<div
							key={chat.id}
							onClick={() => {
								setSelectedChat(chat.id)
								setIsSidebarOpen(false) // Close sidebar on mobile after selection
							}}
							className={`p-4 cursor-pointer hover:bg-gray-800/50 ${
								selectedChat === chat.id ? 'bg-gray-800/50' : ''
							}`}>
							<div className="flex items-center gap-3">
								<div className="flex-1 min-w-0">
									<div className="flex justify-between items-baseline">
										<p className="text-white font-medium truncate">{chat.name}</p>
										<span className="text-xs text-gray-400">{chat.time}</span>
									</div>
									<div className="flex justify-between items-baseline">
										<p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
										{chat.unread > 0 && (
											<div className="text-xs bg-red-400 font-bold rounded-full px-2 py-1 text-white w-4 h-4 flex items-center justify-center ml-2">
												{chat.unread}
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
			<div className="flex-1 flex flex-col">
				{/* Chat header with adjusted padding for mobile */}
				<div className="p-4 pl-16 lg:pl-4 border-b border-gray-800 flex items-center gap-3">
					<span className="text-white font-medium">
						{chats.find(chat => chat.id === selectedChat)?.name}
					</span>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4">
					{messages.map(message => (
						<div
							key={message.id}
							className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}>
							<div
								className={`max-w-[70%] rounded-lg px-4 py-2 ${
									message.isSent ? 'bg-messenger-blue text-white' : 'bg-gray-800 text-white'
								}`}>
								<div className="flex justify-between items-baseline gap-4">
									<span className="font-medium text-sm">
										{message.isSent ? 'You' : message.sender}
									</span>
									<span className="text-xs opacity-70">{message.time}</span>
								</div>
								<p className="mt-1">{message.content}</p>
							</div>
						</div>
					))}
				</div>

				{/* Message input */}
				<div className="p-4 border-t border-gray-800">
					<form className="flex gap-2 items-center">
						<input
							type="text"
							placeholder="Type a message..."
							className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56db]"
						/>
						<Button type="submit" className="bg-blue-500 hover:bg-blue-600 cursor-pointer">
							Send
						</Button>
					</form>
				</div>
			</div>
		</div>
	)
}
