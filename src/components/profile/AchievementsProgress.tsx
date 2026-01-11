import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChallengeProgress } from '@/types/profile';

interface AchievementsProgressProps {
    challenges: ChallengeProgress[];
}

export const AchievementsProgress: React.FC<AchievementsProgressProps> = ({ challenges }) => {
    // If no data, show empty state or skeleton? For now, empty text.
    if (!challenges || challenges.length === 0) {
        return <div className="text-gray-400 text-sm">No hay logros en curso.</div>;
    }

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">Logros en Progreso</h3>
            <div className="space-y-3">
                {challenges.map((achievement) => (
                    <Card key={achievement.id} className="border border-gray-100 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="bg-yellow-100 p-1.5 rounded-full">
                                            <span className="text-yellow-600 text-xs">⚡</span>
                                        </div>
                                        <span className="font-bold text-sm">{achievement.title}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 ml-8">{achievement.description}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold text-gray-400">{achievement.reward_display}</span>
                                </div>
                            </div>

                            <div className="mt-3 flex items-center gap-4">
                                {/* Use percent directly */}
                                <Progress value={achievement.percent} className="h-1.5 flex-1 bg-gray-100 [&>div]:bg-yellow-400" />
                                <span className="text-xs font-bold text-gray-400 w-8 text-right">{achievement.percent}%</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
