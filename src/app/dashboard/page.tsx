import { useContext, useEffect } from "react"
import UserContext from "../../contexts/user-context"
import { useNavigate } from 'react-router'

export default function Dashboard() {

	const [user, isLoading] = useContext(UserContext)
	const navigate = useNavigate()

	useEffect(() => {
		if (!user && !isLoading) {
			navigate('/login')
		}
	}, [user, isLoading])

	return <p>Hello {user?.username}!</p>
}
