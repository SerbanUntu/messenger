import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
	const now = new Date();
	if (now.getDate() === date.getDate()) {
		return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
	}
	if (now.getDate() - date.getDate() === 1) {
		return 'Yesterday';
	}
	return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
