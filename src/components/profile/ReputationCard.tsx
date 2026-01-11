import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ReputationCardProps {
    reputation: number;
}

export const ReputationCard: React.FC<ReputationCardProps> = ({ reputation }) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Reputación</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-6">
                <div className="text-5xl font-bold text-yellow-500">{reputation || 0}</div>
                <p className="text-xs text-gray-500 mt-2">Puntos de Reputación</p>
            </CardContent>
        </Card>
    );
};
