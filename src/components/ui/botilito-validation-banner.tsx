
import React from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Sparkles } from 'lucide-react';

interface BotilitoValidationBannerProps {
    variant?: 'list' | 'detail';
}

export function BotilitoValidationBanner({ variant = 'list', title }: { variant?: 'list' | 'detail', title?: React.ReactNode }) {
    return (
        <div className="bg-[#FFFCE8] border-2 border-[#FFDA00] rounded-xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
            <div className="shrink-0 bg-[#FFDA00] p-3 rounded-full border-4 border-white shadow-md rotate-[-5deg]">
                <img
                    src={botilitoImage}
                    alt="Detective Botilito"
                    className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
            </div>

            <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                    {title ? title : (
                        variant === 'list' ? (
                            <>
                                ¡Ey, mi llave! Ayúdame a mejorar mis diagnósticos validando estos casos
                                <span className="text-2xl">🕵️‍♂️✨</span>
                            </>
                        ) : (
                            <>
                                Revisa este caso y dame tu opinión. ¡Tu validación me ayuda a mejorar!
                                <span className="text-2xl">🎯</span>
                            </>
                        )
                    )}
                </h2>
            </div>
        </div>
    );
}
