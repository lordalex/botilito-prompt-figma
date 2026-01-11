
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function DigitalIABanner() {
    return (
        <div className="bg-[#F3E8FF] rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 border border-purple-100">
            <div className="flex-1 space-y-2">
                <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    ¡Ampliando tus conocimientos con Digital-IA! 🚀
                </h3>
                <p className="text-sm text-purple-800/80">
                    Para fortalecer tus habilidades en la identificación de noticias y la verificación de fuentes, te invitamos a explorar los cursos y formaciones en Alfabetización Mediática e Informacional que nuestro equipo de Digital-IA tiene disponibles.
                </p>
                <a href="#" className="flex items-center gap-1 text-xs text-purple-600 mt-1 hover:underline">
                    ¡Conviértete en un experto en combatir la desinformación!
                </a>
            </div>
            <Button className="bg-[#9333EA] hover:bg-[#7E22CE] text-white shrink-0 shadow-lg shadow-purple-200">
                Visitar Digital-IA <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
}
