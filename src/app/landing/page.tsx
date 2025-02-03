import React from 'react'
import { NavLink } from 'react-router'

export default function Landing() {
	return (
		<>
			<h1>Messenger</h1>
			<button>
				<NavLink to="/login">Login</NavLink>
			</button>
			<button>
				<NavLink to="/sign-up">Sign Up</NavLink>
			</button>
		</>
	)
}
