import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Trophy, Flame } from 'lucide-react';

interface StatsOverviewProps {
    casesRegistered: number;
    validations: number;
    currentStreak: number;
    ranking: number;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ casesRegistered, validations, currentStreak, ranking }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Cases Registered */}
            <Card className="bg-blue-50 border-blue-100">
                <CardContent className="p-4 flex flex-col items-center justify-center py-6">
                    <div className="bg-blue-500 text-white p-2 rounded-full mb-2">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-bold">{casesRegistered}</span>
                    <span className="text-sm text-gray-500">Casos Registrados</span>
                </CardContent>
            </Card>

            {/* Validations */}
            <Card className="bg-green-50 border-green-100">
                <CardContent className="p-4 flex flex-col items-center justify-center py-6">
                    <div className="bg-green-500 text-white p-2 rounded-full mb-2">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-bold">{validations}</span>
                    <span className="text-sm text-gray-500">Validaciones</span>
                </CardContent>
            </Card>

            {/* Current Streak (Racha) */}
            <Card className="bg-orange-50 border-orange-100">
                <CardContent className="p-4 flex flex-col items-center justify-center py-6">
                    <div className="bg-orange-500 text-white p-2 rounded-full mb-2">
                        <Flame className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-bold">{currentStreak}</span>
                    <span className="text-sm text-gray-500">Racha Actual</span>
                </CardContent>
            </Card>

            {/* Ranking */}
            <Card className="bg-purple-50 border-purple-100">
                <CardContent className="p-4 flex flex-col items-center justify-center py-6">
                    <div className="bg-purple-500 text-white p-2 rounded-full mb-2">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-bold">#{ranking}</span>
                    <span className="text-sm text-gray-500">Ranking</span>
                </CardContent>
            </Card>
        </div>
    );
};
