"use client";
import React from 'react';
import { AuthProvider } from '../providers/AuthProvider';
import { ConfigProvider } from '../providers/ConfigProvider';
import { MessageProvider } from '../providers/MessageProvider';
import { SchemaProvider } from '../providers/SchemaProvider';
import { VoteTrackerProvider } from '../providers/VoteTrackerProvider';
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
