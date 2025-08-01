'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

interface ProvidersProps {
    children: React.ReactNode
}

const queryClient = new QueryClient();

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
          {children}
      </QueryClientProvider>
      <ToastContainer />
    </>
  )
}