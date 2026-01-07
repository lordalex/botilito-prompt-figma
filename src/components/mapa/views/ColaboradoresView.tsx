import React from 'react';
import { Crown } from 'lucide-react';

export function ColaboradoresView() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 animate-in fade-in">
      <div className="bg-yellow-100 p-4 rounded-full">
        <Crown className="h-10 w-10 text-yellow-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900">Ranking de Colaboradores</h3>
      <p className="text-gray-500 max-w-md">
        Estamos recopilando datos de gamificación para mostrar los colaboradores más activos. 
        Esta sección estará disponible próximamente una vez que la API de gamificación se integre al dashboard público.
      </p>
    </div>
  );
}
