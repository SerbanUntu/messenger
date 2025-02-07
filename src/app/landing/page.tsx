import { NavLink, useNavigate } from 'react-router'
import { Send, Server, Users, Zap } from 'lucide-react'
import UserContext from '@/src/contexts/user-context'
import { useContext } from 'react'
import { Button } from '@/src/components/ui/button'

export default function Landing() {
	const { user, isUserLoading } = useContext(UserContext)
	const navigate = useNavigate()

	return (
		<div className="min-h-screen bg-gradient-to-br from-dark-navy to-light-navy">
			<header className="px-4 lg:px-6 h-14 flex items-center">
				<NavLink className="flex items-center justify-center" to="/dashboard">
					<Send className="h-6 w-6 text-messenger-blue" />
					<span className="ml-2 text-xl font-bold text-white">Messenger</span>
				</NavLink>
				<nav className="ml-auto flex gap-4 sm:gap-6">
					<NavLink className="text-sm font-medium text-gray-400 hover:text-white" to="/dashboard">
						App
					</NavLink>
					<NavLink className="text-sm font-medium text-gray-400 hover:text-white" to="/login">
						Log in
					</NavLink>
					<NavLink className="text-sm font-medium text-gray-400 hover:text-white" to="/sign-up">
						Sign up
					</NavLink>
				</nav>
			</header>

			<main className="flex-1">
				<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
					<div className="container px-4 md:px-6">
						<div className="flex flex-col items-center space-y-4 text-center">
							<div className="space-y-2">
								<h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none lg:text-7xl/none bg-gradient-to-b from-white to-gray-400 text-transparent bg-clip-text p-4">
									Connect Instantly,
									<br />
									Communicate Seamlessly
								</h1>
								<p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
									Experience real-time messaging with{' '}
									<span className="text-messenger-blue">Messenger</span>. Stay connected with
									friends, family, and colleagues anywhere in the world.
								</p>
							</div>
							<div className="space-x-4">
								<Button
									onClick={() => {
										if (user && !isUserLoading) navigate('/dashboard')
										else navigate('/sign-up')
									}}
									className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-1 cursor-pointer">
									Get Started
								</Button>
							</div>
						</div>
					</div>
				</section>
				<section className="w-full py-12 md:py-24 lg:py-32 bg-[#0d1224]">
					<div className="container px-4 md:px-6">
						<div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-3">
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="p-3 rounded-full bg-blue-500/10">
									<Zap className="h-6 w-6 text-blue-500" />
								</div>
								<h2 className="text-xl font-bold text-white">Lightning Fast</h2>
								<p className="text-gray-400">
									Experience instant message delivery with our optimized infrastructure.
								</p>
							</div>
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="p-3 rounded-full bg-blue-500/10">
									<Users className="h-6 w-6 text-blue-500" />
								</div>
								<h2 className="text-xl font-bold text-white">Community Features</h2>
								<p className="text-gray-400">
									Create groups and channels to stay connected with your friends and colleagues.
								</p>
							</div>
							<div className="flex flex-col items-center space-y-4 text-center">
								<div className="p-3 rounded-full bg-blue-500/10">
									<Server className="h-6 w-6 text-blue-500" />
								</div>
								<h2 className="text-xl font-bold text-white">Lightweight Backend</h2>
								<p className="text-gray-400">
									With a simple Express backend, we can process your messages at lightning speed.
								</p>
							</div>
						</div>
					</div>
				</section>
			</main>
			<footer className="w-full border-t border-gray-700 py-6 bg-dark-navy">
				<div className="container flex flex-col items-center justify-between gap-4 px-4 text-center md:px-6">
					<p className="text-sm text-gray-400">{`© ${new Date().getFullYear()} Șerban Untu. All rights reserved.`}</p>
				</div>
			</footer>
		</div>
	)
}
