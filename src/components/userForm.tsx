import React from 'react'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/src/components/ui/card'
import { server } from '../constants'

interface UserFormProps {
	buttonText: string
	action: string
}

export default function UserForm({ buttonText, action }: UserFormProps) {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		fetch(server + action, {
			method: 'POST',
			body: JSON.stringify({
				username,
				password,
			}),
			headers: {
				Host: 'localhost:3000',
				'Content-Type': 'application/json',
			},
		})
	}

	return (
		<Card className="w-full max-w-md bg-gray-900 text-gray-100 border-0 shadow-lg">
			<CardHeader>
				<CardTitle className="text-2xl font-bold">{buttonText}</CardTitle>
			</CardHeader>
			<form onSubmit={handleSubmit}>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="username" className="text-gray-200">
							Username
						</Label>
						<Input
							id="username"
							type="text"
							placeholder="Enter your username"
							value={username}
							onChange={e => setUsername(e.target.value)}
							className="bg-gray-800 border-gray-700 placeholder-gray-500 text-white mt-2"
							maxLength={30}
							required
						/>
					</div>
					<div className="space-y-2">
						<Label htmlFor="password" className="text-gray-200">
							Password
						</Label>
						<Input
							id="password"
							type="password"
							placeholder="Enter your password"
							value={password}
							onChange={e => setPassword(e.target.value)}
							className="bg-gray-800 border-gray-700 placeholder-gray-500 text-white mt-2"
							required
							maxLength={50}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<Button
						type="submit"
						className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer">
						{buttonText}
					</Button>
				</CardFooter>
			</form>
		</Card>
	)
}
