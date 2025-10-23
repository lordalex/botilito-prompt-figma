// src/providers/Providers.tsx

import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { ConfigProvider } from './ConfigProvider';
import { MessageProvider } from './MessageProvider';
import { SchemaProvider } from './SchemaProvider';
import { JobTrackerProvider } from './JobTrackerProvider';

/**
 * A single component to wrap the entire application with all necessary context providers.
 * This simplifies the main application entry point.
 */
export const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <ConfigProvider>
      <MessageProvider>
        <SchemaProvider>
          <AuthProvider>
            <JobTrackerProvider>
              {children}
            </JobTrackerProvider>
          </AuthProvider>
        </SchemaProvider>
      </MessageProvider>
    </ConfigProvider>
  );
};
