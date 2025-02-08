import React, { useContext, useEffect } from 'react'
import UserForm from '@/src/components/userForm'
import { NavLink } from 'react-router'
import { toast } from '@/src/hooks/use-toast'
import { useNavigate } from 'react-router'
import UserContext from '@/src/contexts/user-context'

export default function Login() {
	const navigate = useNavigate()
	const { user, setUser, isUserLoading } = useContext(UserContext)

	const onSubmit = async (e: React.FormEvent, username: string, password: string) => {
		e.preventDefault()

		const res = await fetch(`${process.env.EXPOSED_SERVER_ADDRESS}/api/v1/login`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				username,
				password,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
		})
		if (res.ok) {
			toast({
				title: 'Login successful',
				description: 'You are now logged in',
				variant: 'success',
			})
			const data = await res.json()
			setUser(data)
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
		<div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-black to-blue-950 relative">
			{user && !isUserLoading && (
				<div className="flex items-center gap-4 top-2 absolute border border-amber-600 px-4 py-2 rounded-md text-amber-600">
					<span>You are already logged in</span>
					<NavLink className="border rounded-md px-4 py-2 border-white bg-transparent text-white hover:bg-white hover:text-black cursor-pointer" to="/dashboard">
						Go to app
					</NavLink>
				</div>
			)}
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
