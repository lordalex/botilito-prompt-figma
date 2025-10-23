import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';

interface BuilderConfig { authFlows: Record<string, any>; }
interface StylingConfig { views: Record<string, any>; }

interface ConfigContextType {
  builderConfig: BuilderConfig | null;
  stylingConfig: StylingConfig | null;
  isLoading: boolean;
  getStyles: (viewName?: string) => any;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [builderConfig, setBuilderConfig] = useState<BuilderConfig | null>(null);
  const [stylingConfig, setStylingConfig] = useState<StylingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/builder.json').then(res => res.json()),
      fetch('/form.json').then(res => res.json()),
    ]).then(([builderData, formData]) => {
      setBuilderConfig(builderData);
      setStylingConfig(formData);
    }).catch(error => {
        console.error("Failed to load configuration files:", error);
    }).finally(() => setIsLoading(false));
  }, []);

  const getStyles = useCallback((viewName?: string) => {
    if (!stylingConfig || !viewName || !stylingConfig.views[viewName]) {
      return { formClassName: '', fieldOverrides: {} };
    }
    return stylingConfig.views[viewName];
  }, [stylingConfig]);

  const value = useMemo(() => ({
    builderConfig,
    stylingConfig,
    isLoading,
    getStyles
  }), [builderConfig, stylingConfig, isLoading, getStyles]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error("useConfig must be used within a ConfigProvider");
  return context;
};
