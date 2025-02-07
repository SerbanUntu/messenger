import { createContext } from 'react';
import { UserWithSocket } from '../types';

interface UserContextType {
	user: UserWithSocket | null;
	setUser: (user: UserWithSocket | null) => void;
	isUserLoading: boolean;
	setIsUserLoading: (isUserLoading: boolean) => void;
}

const UserContext = createContext<UserContextType>({
	user: null,
	setUser: () => null,
	isUserLoading: true,
	setIsUserLoading: () => true,
});

export default UserContext;
