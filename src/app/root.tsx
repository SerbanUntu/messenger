import { Outlet } from "react-router";
import { Toaster } from "../components/ui/toaster";

export default function Root() {
	return (
		<>
			<Outlet />
			<Toaster />
		</>
	)
}
