
import React from 'react';
import botilitoImage from '@/assets/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import botilitoInspector from '@/assets/botilito-mascot.png';

interface BotilitoValidationBannerProps {
    variant?: 'list' | 'detail';
    title?: React.ReactNode;
}

/**
 * Banner component styled to match Mapa Desinfodémico banner.
 * Uses solid yellow background (#ffe97a) with Botilito mascot overlapping at bottom.
 */
export function BotilitoValidationBanner({ variant = 'list', title }: BotilitoValidationBannerProps) {
    const defaultTitle = variant === 'list'
        ? '¡Ey, mi llave! Ayúdame a mejorar mis diagnósticos validando estos casos'
        : 'Revisa este caso y dame tu opinión. ¡Tu validación me ayuda a mejorar!';

    const defaultDescription = variant === 'list'
        ? 'Tu opinión experta es vital para entrenar mi diagnóstico. Cada validación me ayuda a ser más preciso detectando desinformación. ¡Vamos a combatir la desinfodemia juntos! 💪🦠'
        : 'Analiza la información, revisa las fuentes y comparte tu criterio. ¡Tu experiencia marca la diferencia! 🎯';

    return (
        <div className="bg-[#ffe97a] border-2 border-[#ffda00] rounded-lg p-4 shadow-lg mb-6">
            <div className="flex items-center space-x-4">
                <img
                    src={title ? botilitoImage : botilitoInspector}
                    alt="Detective Botilito"
                    className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
                />
                <div className="flex-1">
                    {title ? (
                        <div className="text-xl font-semibold">{title}</div>
                    ) : (
                        <>
                            <p className="text-xl">
                                {defaultTitle} {variant === 'list' ? '🕵️‍♂️✨' : '🎯'}
                            </p>
                            <p className="text-sm mt-1 opacity-80">
                                {defaultDescription}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
