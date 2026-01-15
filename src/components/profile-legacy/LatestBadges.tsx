import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const LatestBadges: React.FC = () => {
    // Mock data for badges
    const badges = [
        { id: 1, name: "Primer Diagnóstico", date: "14/5/2024", points: 50, icon: "🩺", color: "bg-orange-500" },
        { id: 2, name: "Vigilante Constante", date: "20/4/2024", points: 100, icon: "👁️", color: "bg-orange-600" },
        { id: 3, name: "Explorador AMI", date: "17/5/2024", points: 25, icon: "🗺️", color: "bg-orange-500" },
        { id: 4, name: "Detector Serial", date: "5/12/2024", points: 200, icon: "🕵️", color: "bg-gray-400" },
    ];

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Últimas Insignias Ganadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {badges.map((badge) => (
                    <Card key={badge.id} className="border border-gray-100 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 ${badge.color} rounded-full flex items-center justify-center text-xl text-white`}>
                                    {badge.icon}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{badge.name}</div>
                                    <div className="text-xs text-gray-400">{badge.date}</div>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                                +{badge.points} PT
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
