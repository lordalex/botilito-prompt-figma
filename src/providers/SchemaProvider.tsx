import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';

export interface SchemaProperty { type: string; format?: string; enum?: string[]; "x-label"?: string; "x-placeholder"?: string; "x-type"?: string; "x-layout-group"?: string; }
export interface SchemaModel { type: "object"; properties: Record<string, SchemaProperty>; required?: string[]; }

interface SchemaContextType {
  getOrFetchSchema: (modelName: string) => Promise<SchemaModel>;
}

const SchemaContext = createContext<SchemaContextType | undefined>(undefined);

const departments = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];

const clientSchemas: Record<string, SchemaModel> = {
  login_schema: { type: "object", properties: { email: { type: "string", format: "email" }, password: { type: "string", "x-type": "password" } }, required: ["email", "password"] },
  register_schema: { type: "object", properties: { fullName: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string", "x-type": "tel" }, department: { type: "string", enum: departments }, city: { type: "string" }, birthDate: { type: "string", "x-type": "date" }, password: { type: "string", "x-type": "password" }, confirmPassword: { type: "string", "x-type": "password" } }, required: ["fullName", "email", "password", "confirmPassword", "department", "city", "birthDate"] }
};

export const SchemaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getOrFetchSchema = useCallback(async (modelName: string): Promise<SchemaModel> => {
    if (clientSchemas[modelName]) {
      return clientSchemas[modelName];
    }
    throw new Error(`Schema for ${modelName} not found.`);
  }, []);

  const value = useMemo(() => ({ getOrFetchSchema }), [getOrFetchSchema]);

  return <SchemaContext.Provider value={value}>{children}</SchemaContext.Provider>;
};

export const useSchema = (): SchemaContextType => {
  const context = useContext(SchemaContext);
  if (context === undefined) {
    throw new Error("useSchema must be used within a SchemaProvider.");
  }
  return context;
};
