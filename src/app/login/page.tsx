import React from 'react'
import UserForm from '@/src/components/userForm'
import { NavLink } from 'react-router'

export default function Login() {
	return (
		<div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-black to-blue-950">
			<UserForm buttonText="Login" action="/api/v1/login" />
			<p className="text-gray-500 text-sm">
				Don't have an account?{' '}
				<NavLink to="/sign-up" className="text-blue-500 hover:underline">
					Sign up
				</NavLink>
			</p>
		</div>
	)
}
