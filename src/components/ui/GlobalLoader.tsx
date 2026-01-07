import React from 'react';
import { Activity } from 'lucide-react';
import botilitoSearch from '@/assets/ce81bb4aba8c9f36807cd145a086a12ce7f876dc.png';
import { Card, CardContent } from '@/components/ui/card';

interface GlobalLoaderProps {
    message?: string;
}

export function GlobalLoader({ message = "Procesando información..." }: GlobalLoaderProps) {
    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm min-h-[60vh]">
            <div className="flex justify-center mb-8">
                <img
                    src={botilitoSearch}
                    alt="Botilito trabajando"
                    className="w-32 h-32 md:w-48 md:h-48 object-contain animate-bounce"
                />
            </div>
            <Card className="w-full max-w-md shadow-xl border-2 border-yellow-400">
                <CardContent className="p-8 space-y-4 text-center">
                    <h2 className="text-xl font-bold flex items-center justify-center gap-2 text-gray-800">
                        <Activity className="h-6 w-6 text-yellow-500" />
                        {message}
                    </h2>
                    <p className="text-sm text-gray-500">Estamos analizando los datos solicitados en tiempo real.</p>
                </CardContent>
            </Card>
        </div>
    );
}
