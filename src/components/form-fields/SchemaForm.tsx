import React, { useMemo } from 'react';
import { useForm, FieldValues, ControllerRenderProps } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';
import { useConfig } from '@/providers/ConfigProvider';
import type { SchemaProperty, SchemaModel } from '@/providers/SchemaProvider';
import { Eye, EyeOff } from 'lucide-react';

interface SchemaFormProps { modelSchema: SchemaModel; view: string; onSubmit: (data: Record<string, unknown>) => Promise<void>; isSubmitting?: boolean; submitText?: string; }

const renderField = (prop: SchemaProperty, field: ControllerRenderProps<FieldValues, any>, overrides?: any) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const allProps = { ...field, ...overrides };

    if (prop.enum) {
        return (
            <Select onValueChange={allProps.onChange} defaultValue={allProps.value}>
                <FormControl><SelectTrigger className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors"><SelectValue placeholder={overrides?.placeholder || `Seleccionar...`} /></SelectTrigger></FormControl>
                <SelectContent>{prop.enum.map((option: string) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
            </Select>
        );
    }
    
    if (prop['x-type'] === 'password') {
        return (
            <div className="relative">
                <Input {...allProps} type={showPassword ? 'text' : 'password'} value={allProps.value || ''} className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
        )
    }

    return <Input {...allProps} type={prop['x-type'] || prop.format || 'text'} value={allProps.value || ''} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors" />;
};

export const SchemaForm: React.FC<SchemaFormProps> = ({ modelSchema, view, onSubmit, isSubmitting = false, submitText = 'Submit' }) => {
    const { getStyles } = useConfig();
    const viewStyles = getStyles(view);
    const form = useForm();
    
    const fieldsToRender = useMemo(() => {
        if (!modelSchema?.properties) return [];
        return Object.entries(modelSchema.properties)
            .map(([fieldName, prop]) => ({
                fieldName,
                prop,
                order: viewStyles.fieldOverrides?.[fieldName]?.order ?? 999
            }))
            .sort((a, b) => a.order - b.order);
    }, [modelSchema, viewStyles]);

    const groupedFields = useMemo(() => {
        return fieldsToRender.reduce((acc, { fieldName, prop }) => {
            const groupKey = prop['x-layout-group'] || `single_${fieldName}`;
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push({ fieldName, prop });
            return acc;
        }, {} as Record<string, { fieldName: string; prop: SchemaProperty }[]>);
    }, [fieldsToRender]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit as any)} className={viewStyles.formClassName || 'space-y-4'}>
                {Object.values(groupedFields).map((group, groupIndex) => (
                    <div key={groupIndex} className="flex flex-col sm:flex-row gap-4">
                        {group.map(({ fieldName, prop }) => {
                            const fieldOverrides = viewStyles.fieldOverrides?.[fieldName];
                            const label = (fieldOverrides?.label as string) || prop['x-label'] || fieldName;
                            return (
                                <FormField
                                    key={fieldName}
                                    control={form.control}
                                    name={fieldName}
                                    render={({ field }) => (
                                        <FormItem className="flex-1 min-w-0">
                                            <FormLabel className="text-gray-700">{label}</FormLabel>
                                            <FormControl>{renderField(prop, field, fieldOverrides)}</FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            );
                        })}
                    </div>
                ))}
                <Button type="submit" disabled={isSubmitting} className="w-full !mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Procesando...' : submitText}
                </Button>
            </form>
        </Form>
    );
};
