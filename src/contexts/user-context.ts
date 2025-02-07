import { createContext } from 'react';
import { User } from '../types';

interface UserContextType {
	user: User | null;
	setUser: (user: User | null) => void;
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
