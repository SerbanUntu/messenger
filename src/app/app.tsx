import React, { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import { BrowserRouter } from 'react-router'
import Landing from './landing/page'
import Login from './login/page'
import SignUp from './sign-up/page'
import NotFound from './404/page'
import Dashboard from './dashboard/page'
import { User } from '../types'
import UserContext from '../contexts/user-context'
import { server } from '../constants'
import Root from './root'

const App = () => {
	const [user, setUser] = useState<User | null>(null)
	const [isUserLoading, setIsUserLoading] = useState(true)

	useEffect(() => {
		const userPromise = fetch(server + '/api/v1/users/currentUser', {
			credentials: 'include',
		})
		userPromise.then(res => {
			if (res.ok) {
				res.json().then(user => {
					setUser(user)
					setIsUserLoading(false)
				})
			} else {
				setUser(null)
				setIsUserLoading(false)
			}
		})
	}, [])

	return (
		<UserContext.Provider value={{ user, setUser, isUserLoading, setIsUserLoading }}>
			<BrowserRouter>
				<Routes>
					<Route element={<Root />}>
						<Route path="/" element={<Landing />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/sign-up" element={<SignUp />} />
						<Route path="/login" element={<Login />} />
						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</UserContext.Provider>
	)
}

export default App
