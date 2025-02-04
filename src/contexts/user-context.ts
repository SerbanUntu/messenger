import { createContext } from 'react';
import { User } from '../types';

const UserContext = createContext<[User | null, boolean]>([null, true]);

export default UserContext;
