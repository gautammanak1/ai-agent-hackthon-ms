'use client';

import { ReactNode } from 'react';
import { InterviewProvider } from '@/lib/contexts/interview-context';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <InterviewProvider>
      {children}
    </InterviewProvider>
  );
}