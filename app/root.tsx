import { Center, Spinner } from "@chakra-ui/react";
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
