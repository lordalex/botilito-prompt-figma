import React, { useMemo, useState, useEffect } from 'react';
import { useConfig } from '@/providers/ConfigProvider';
import { useSchema, type SchemaModel } from '@/providers/SchemaProvider';
import { useMessages } from '@/providers/MessageProvider';
import { SchemaForm } from '@/components/form-fields/SchemaForm';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { signIn, signUp } from '@/utils/supabase/auth';

interface AuthBuilderProps {
  workflowName: "loginFlow" | "registerFlow";
  onSuccess: () => void;
}

const AuthBuilder: React.FC<AuthBuilderProps> = ({ workflowName, onSuccess }) => {
  const { builderConfig, isLoading: isConfigLoading } = useConfig();
  const { getOrFetchSchema } = useSchema();
  const { messages, isLoading: isLoadingMessages } = useMessages();
  
  const [modelSchema, setModelSchema] = useState<SchemaModel | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(true);
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const workflow = useMemo(() => builderConfig?.authFlows[workflowName], [builderConfig, workflowName]);
  const messageKey = workflowName === 'loginFlow' ? 'login' : 'register';
  const workflowMessages = useMemo(() => messages?.auth?.[messageKey], [messages, messageKey]);

  useEffect(() => {
    if (workflow?.baseModel && getOrFetchSchema) {
      setIsLoadingSchema(true);
      setSchemaError(null);
      getOrFetchSchema(workflow.baseModel)
        .then(schema => setModelSchema(schema))
        .catch(err => setSchemaError(err.message))
        .finally(() => setIsLoadingSchema(false));
    } else {
        setIsLoadingSchema(false);
    }
  }, [workflow, getOrFetchSchema]);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
        if (workflowName === 'loginFlow') {
            await signIn({ email: formData.email as string, password: formData.password as string });
        } else if (workflowName === 'registerFlow') {
            if (formData.password !== formData.confirmPassword) throw new Error("Las contraseñas no coinciden.");
            await signUp({
                email: formData.email as string,
                password: formData.password as string,
                name: formData.fullName as string,
                phone: formData.phone as string,
                location: `${formData.city}, ${formData.department}`,
                birthDate: formData.birthDate as string
            });
            alert("¡Registro exitoso! Por favor, revisa tu correo para verificar tu cuenta.");
        }
        onSuccess();
    } catch (err: any) {
        setAuthError(err.message || "Ocurrió un error.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const isLoading = isConfigLoading || isLoadingSchema || isLoadingMessages;
  if (isLoading || !builderConfig || !workflow || !modelSchema) {
    return <div className="flex h-64 w-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  
  if (schemaError) { return (<Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error de Formulario</AlertTitle><AlertDescription>{schemaError}</AlertDescription></Alert>); }

  return (
    <>
      {authError && (<Alert variant="destructive" className="my-4"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{authError}</AlertDescription></Alert>)}
      <SchemaForm modelSchema={modelSchema} view={workflow.view} onSubmit={handleSubmit} isSubmitting={isSubmitting} submitText={workflowMessages?.submit_button}/>
    </>
  );
};

export default AuthBuilder;
