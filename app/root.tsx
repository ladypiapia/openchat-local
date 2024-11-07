import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { Provider } from "~/components/ui/provider";

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="zh" suppressHydrationWarning>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
				<script
					defer
					src="https://u.pexni.com/script.js"
					data-website-id="def9294d-d8fe-48d8-a985-4251f74bb49a"
				/>
			</body>
		</html>
	);
}

const queryClient = new QueryClient();

export default function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Provider>
				<Outlet />
			</Provider>
		</QueryClientProvider>
	);
}
