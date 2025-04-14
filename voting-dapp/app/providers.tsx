"use client";

import { Web3Provider } from "@/contexts/Web3Context";
import { Toaster } from "sonner";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Web3Provider>
      {children}
      <Toaster position="top-center" richColors />
    </Web3Provider>
  );
}
