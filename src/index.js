import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/app.tsx'
import SignUp from './app/sign-up/page.tsx'
import Login from './app/login/page.tsx'
import CSS from './globals.css'
import { BrowserRouter, Routes, Route } from 'react-router'

const root = ReactDOM.createRoot(document.querySelector('#root'))
root.render(
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<App />} />
			<Route path="/sign-up" element={<SignUp />} />
			<Route path="/login" element={<Login />} />
		</Routes>
	</BrowserRouter>
)
