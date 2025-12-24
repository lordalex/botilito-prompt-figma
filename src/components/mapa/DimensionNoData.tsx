import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle } from 'lucide-react';

interface DimensionNoDataProps {
    label: string;
}

export function DimensionNoData({ label }: DimensionNoDataProps) {
    return (
        <Card className="border-dashed border-2">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-muted-foreground opacity-70">
                    <AlertCircle className="h-6 w-6" />
                    <span>{label}</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex flex-col items-center justify-center space-y-3">
                <div className="p-4 bg-secondary/20 rounded-full">
                    <AlertCircle className="h-10 w-10 text-muted-foreground opacity-50" />
                </div>
                <div className="text-center">
                    <p className="font-medium text-muted-foreground">Datos no disponibles</p>
                    <p className="text-sm text-muted-foreground/60 max-w-xs">
                        Para esta dimensión aún no se han procesado indicadores en tiempo real. Activa el Modo Demo para ver un ejemplo.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
