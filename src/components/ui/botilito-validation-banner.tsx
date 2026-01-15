import React from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';

interface BotilitoBannerProps {
    variant?: 'list' | 'detail';
    text?: React.ReactNode;
    icon?: string; // URL for the new icon
}

export function BotilitoBanner({ variant = 'list', text, icon }: BotilitoBannerProps) {
    const imageSrc = icon || botilitoImage;

    const defaultTexts = {
        list: (
            <>
                <span>¡Ey, mi llave! Ayúdame a mejorar mis diagnósticos validando estos casos</span>
                <span className="text-lg">🕵️‍♂️✨</span>
            </>
        ),
        detail: (
            <>
                <span>Revisa este caso y dame tu opinión. ¡Tu validación me ayuda a mejorar!</span>
                <span className="text-lg">🎯</span>
            </>
        )
    };

    const content = text || defaultTexts[variant];

    return (
        <div className="bg-[#ffe97a] rounded-xl px-5 py-2 mb-6 flex flex-row items-center gap-3 shadow-sm">
            <div className="shrink-0">
                <img
                    src={imageSrc}
                    alt="Detective Botilito"
                    className="w-10 h-10 object-contain drop-shadow-sm"
                />
            </div>

            <div className="flex-1 text-left">
                <h2 className="text-sm md:text-base font-bold text-gray-900 flex flex-row items-center justify-start gap-2 leading-tight">
                    {content}
                </h2>
            </div>
        </div>
    );
}

/**
 * @deprecated Use BotilitoBanner instead. This is provided for backward compatibility.
 */
export const BotilitoValidationBanner = BotilitoBanner;