import React from 'react'
import UserForm from '@/src/components/userForm'
import { NavLink } from 'react-router'

export default function SignUp() {
	return (
		<div className="min-h-screen flex flex-col gap-4 items-center justify-center bg-gradient-to-br from-black to-blue-950">
			<UserForm buttonText="Sign Up" action="/api/v1/users" />
			<p className="text-gray-500 text-sm">
				Already have an account?{' '}
				<NavLink to="/login" className="text-blue-500 hover:underline">
					Login
				</NavLink>
			</p>
		</div>
	)
}
