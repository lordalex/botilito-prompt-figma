"use client";
import React from 'react';
import { AuthProvider } from './AuthProvider';
import { ConfigProvider } from './ConfigProvider';
import { MessageProvider } from './MessageProvider';
import { SchemaProvider } from './SchemaProvider';
import { VoteTrackerProvider } from './VoteTrackerProvider';
import { Toaster } from './ui/toaster'; // Asegurar que Toaster se importa aquí

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
      <MessageProvider>
        <SchemaProvider>
          <AuthProvider>
            <VoteTrackerProvider>
              {children}
              <Toaster />
            </VoteTrackerProvider>
          </AuthProvider>
        </SchemaProvider>
      </MessageProvider>
    </ConfigProvider>
  );
}
