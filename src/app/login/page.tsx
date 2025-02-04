import React from 'react'
import UserForm from '@/src/components/userForm'
import { NavLink } from 'react-router'
import { server } from '@/src/constants'
import { toast } from '@/src/hooks/use-toast'
import { useNavigate } from 'react-router'

export default function Login() {
	const navigate = useNavigate()

	const onSubmit = async (e: React.FormEvent, username: string, password: string) => {
		e.preventDefault()

		const res = await fetch(server + '/api/v1/login', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				username,
				password,
			}),
			headers: {
				Host: 'localhost:3000',
				'Content-Type': 'application/json',
			},
		})
		if (res.ok) {
			toast({
				title: 'Login successful',
				description: 'You are now logged in',
				variant: 'success',
			})
			navigate('/dashboard')
		} else {
			const data = await res.json()
			toast({
				title: 'Login failed',
				description: data.error,
				variant: 'destructive',
			})
		}
	}

	return (
		<div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-black to-blue-950">
			<UserForm buttonText="Login" onSubmit={onSubmit} />
			<p className="text-gray-500 text-sm">
				Don't have an account?{' '}
				<NavLink to="/sign-up" className="text-blue-500 hover:underline">
					Sign up
				</NavLink>
			</p>
		</div>
	)
}
