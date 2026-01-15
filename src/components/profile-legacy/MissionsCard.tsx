import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Target } from 'lucide-react';

interface MissionsCardProps {
    challenges: any[]; // Using any[] for now as challenge type structure wasn't strictly defined in profile-api.json
}

export const MissionsCard: React.FC<MissionsCardProps> = ({ challenges }) => {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-yellow-500" />
                    Misiones y Desafíos Activos
                </CardTitle>
            </CardHeader>
            <CardContent>
                {challenges && challenges.length > 0 ? (
                    <ul className="space-y-3">
                        {challenges.map((c: any) => (
                            <li key={c.id || Math.random()} className="text-sm border-b pb-2 last:border-0 last:pb-0">
                                {c.title || c.description || 'Misión sin título'}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-gray-400">No hay misiones activas.</p>
                )}
            </CardContent>
        </Card>
    );
};
