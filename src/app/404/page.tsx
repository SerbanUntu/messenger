import React from 'react'
import { NavLink } from 'react-router'
import { Frown } from 'lucide-react'

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
			<div className="text-center space-y-6 animate-fade-in">
				<Frown className="w-24 h-24 mx-auto text-red-500" />
				<div className="flex items-center justify-center space-x-4 font-monospace">
					<h1 className="text-6xl font-bold">404</h1>
					<div className="h-12 w-px bg-white"></div>
					<h2 className="text-3xl">Page Not Found</h2>
				</div>
				<p className="text-xl">Oops! The page you're looking for doesn't exist.</p>
				<NavLink
					to="/"
					className="inline-block px-6 py-3 text-lg font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors duration-300">
					Return Home
				</NavLink>
			</div>
		</div>
	)
}
