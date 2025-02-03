import React, { useState } from 'react'

export default function Login() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	return (
		<form
			onSubmit={e => {
				e.preventDefault()
				fetch('/api/v1/login', {
					method: 'POST',
					body: JSON.stringify({
						username: username,
						password: password,
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
			<button type="submit">Login</button>
		</form>
	)
}
