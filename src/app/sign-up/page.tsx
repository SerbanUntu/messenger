import React, { useState } from 'react'

export default function SignUp() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				fetch('/api/v1/users', {
					method: 'POST',
					body: JSON.stringify({
						username,
						password,
					}),
					headers: {
						'Content-Type': 'application/json',
					},
				})
			}}>
			<input
				type="text"
				placeholder="Username"
				value={username}
				onChange={e => setUsername(e.target.value)}
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={e => setPassword(e.target.value)}
			/>
			<button type="submit">Sign Up</button>
		</form>
	)
}
