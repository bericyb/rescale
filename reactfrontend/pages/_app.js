import "../styles/globals.css";
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          error: {
            style: {
              background: '#dc2626',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
          },
          success: {
            style: {
              background: '#16a34a',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#16a34a',
            },
          },
        }}
      />
    </QueryClientProvider>
  )
}

export default MyApp;
