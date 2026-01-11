import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell } from 'lucide-react';

interface NotificationSettingsCardProps {
    pollingInterval: number;
    onPollingChange: (interval: number) => void;
}

export const NotificationSettingsCard: React.FC<NotificationSettingsCardProps> = ({ pollingInterval, onPollingChange }) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Bell className="h-4 w-4" />
                    Configuración de Notificaciones
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium">Frecuencia de Actualización</p>
                        <p className="text-xs text-gray-500">Cada cuánto buscamos nuevas alertas.</p>
                    </div>
                    <Select value={pollingInterval.toString()} onValueChange={(v) => onPollingChange(parseInt(v))}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="30000">Normal (30s)</SelectItem>
                            <SelectItem value="60000">Lento (1m)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    );
};
