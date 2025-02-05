import React from 'react'
import UserForm from '@/src/components/userForm'
import { NavLink, useNavigate } from 'react-router'
import { server } from '../../constants'
import { toast } from '@/src/hooks/use-toast'

export default function SignUp() {
	const navigate = useNavigate()

	const onSubmit = async (e: React.FormEvent, username: string, password: string) => {
		e.preventDefault()
		const res = await fetch(server + '/api/v1/users', {
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
		if (res.ok) {
			toast({
				title: 'Sign up successful',
				description: 'You can now log into your account',
				variant: 'success',
			})
			navigate('/login')
		} else {
			const data = await res.json()
			toast({
				title: 'Sign up failed',
				description: data.error,
				variant: 'destructive',
			})
		}
	}

	return (
		<div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-black to-blue-950">
			<UserForm buttonText="Sign Up" onSubmit={onSubmit} />
			<p className="text-gray-500 text-sm">
				Already have an account?{' '}
				<NavLink to="/login" className="text-blue-500 hover:underline">
					Login
				</NavLink>
			</p>
		</div>
	)
}
