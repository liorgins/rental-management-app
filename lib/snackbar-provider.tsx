"use client"

import { SnackbarProvider as NotistackProvider } from "notistack"

interface SnackbarProviderProps {
  children: React.ReactNode
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  return (
    <NotistackProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      autoHideDuration={5000}
      dense
      preventDuplicate
    >
      {children}
    </NotistackProvider>
  )
}
