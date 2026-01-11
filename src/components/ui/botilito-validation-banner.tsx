
import React from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { Sparkles } from 'lucide-react';

interface BotilitoValidationBannerProps {
    variant?: 'list' | 'detail';
}

export function BotilitoValidationBanner({ variant = 'list', title }: { variant?: 'list' | 'detail', title?: React.ReactNode }) {
    return (
        <div className="bg-[#ffe97a] rounded-xl px-5 py-2 mb-6 flex flex-row items-center gap-3 shadow-sm">
            <div className="shrink-0">
                <img
                    src={botilitoImage}
                    alt="Detective Botilito"
                    className="w-10 h-10 object-contain drop-shadow-sm"
                />
            </div>

            <div className="flex-1 text-left">
                <h2 className="text-sm md:text-base font-bold text-gray-900 flex flex-row items-center justify-start gap-2 leading-tight">
                    {title ? title : (
                        variant === 'list' ? (
                            <>
                                <span>¡Ey, mi llave! Ayúdame a mejorar mis diagnósticos validando estos casos</span>
                                <span className="text-lg">🕵️‍♂️✨</span>
                            </>
                        ) : (
                            <>
                                <span>Revisa este caso y dame tu opinión. ¡Tu validación me ayuda a mejorar!</span>
                                <span className="text-lg">🎯</span>
                            </>
                        )
                    )}
                </h2>
            </div>
        </div>
    );
}
