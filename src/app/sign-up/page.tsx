import React, { useContext, useEffect } from 'react'
import UserForm from '@/src/components/userForm'
import { NavLink, useNavigate } from 'react-router'
import { server } from '../../constants'
import { toast } from '@/src/hooks/use-toast'
import UserContext from '@/src/contexts/user-context'

export default function SignUp() {
	const navigate = useNavigate()
	const { user, isUserLoading } = useContext(UserContext)

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
		<div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-black to-blue-950 relative">
			{user && !isUserLoading && (
				<div className="flex items-center gap-4 top-2 absolute border border-amber-600 px-4 py-2 rounded-md text-amber-600">
					<span>You are already logged in</span>
					<NavLink className="border rounded-md px-4 py-2 border-white bg-transparent text-white hover:bg-white hover:text-black cursor-pointer" to="/dashboard">
						Go to app
					</NavLink>
				</div>
			)}
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
