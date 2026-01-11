import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Flame } from 'lucide-react';

interface ActivitySummaryProps {
    streak?: number;
}

export const ActivitySummary: React.FC<ActivitySummaryProps> = ({ streak = 0 }) => {
    return (
        <React.Fragment>
            <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold text-lg">Resumen de Actividad</h3>
            </div>
            <p className="text-sm text-gray-500 mb-4">Tu contribución a la lucha contra la desinformación</p>

            <Card className="bg-orange-50 border-orange-100 mb-6">
                <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-orange-500 text-white p-3 rounded-full">
                            <Flame className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">Racha de Vigilancia Activa</h4>
                            <p className="text-sm text-gray-600">¡Llevas {streak} días consecutivos protegiendo la verdad!</p>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-3xl font-bold text-orange-500">{streak}</div>
                        <div className="text-xs text-orange-400 font-bold uppercase">Días 🔥</div>
                    </div>
                </CardContent>
            </Card>
        </React.Fragment>
    );
};
