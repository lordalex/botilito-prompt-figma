import React from 'react';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';

export const ProfileBanner: React.FC = () => {
    return (
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-xl p-4">
            <div className="flex items-center gap-4">
                <img src={botilitoImage} alt="Botilito" className="w-16 h-16 object-contain" />
                <div>
                    <p className="text-lg font-semibold">¡Qué más parce! Este es tu espacio personal 👤✨</p>
                    <p className="text-sm opacity-80">
                        Acá está tu nivel, XP, insignias y misiones. Mientras más analices, más subes de nivel. ¡A darle con toda! 💪🏆
                    </p>
                </div>
            </div>
        </div>
    );
};
