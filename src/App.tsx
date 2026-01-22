import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Router from "./Router"

import { Toaster } from 'sonner';
import { ThemeProvider } from "./providers/theme-provider";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// staleTime: 1000 * 60 * 5, // 5 minutes
		},
		mutations: {
			retry: false,
		},
	}
})

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="dark" storageKey="eyplease-admin-ui-theme">
				<Router />
				<Toaster
					position="bottom-center"
					toastOptions={{
						classNames: {
							error: 'text-white bg-danger-500',
							success: 'text-white bg-primary',
							warning: 'text-yellow-400',
							info: 'bg-blue-400',
						},
					}}
				/>
			</ThemeProvider>
		</QueryClientProvider>
	)
}

export default App
