import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BadgesGalleryProps {
    badges?: any[]; // Placeholder for badges type
}

export const BadgesGallery: React.FC<BadgesGalleryProps> = ({ badges = [] }) => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-base">Insignias</CardTitle>
            </CardHeader>
            <CardContent>
                {badges.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                        {/* Placeholder logic for badges */}
                        {badges.map((b, i) => (
                            <div key={i} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xs">
                                🏆
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">Sin insignias aún.</p>
                )}
            </CardContent>
        </Card>
    );
};
