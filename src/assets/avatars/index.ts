/**
 * Avatares predeterminados del sistema Botilito
 * 
 * Formato: SVG (Avatars-01.svg a Avatars-13.svg)
 */

export interface DefaultAvatar {
    id: string;
    name: string;
    filename: string;
    category: 'medico' | 'cientifico' | 'vigilante' | 'personaje';
    description: string;
}

export const defaultAvatars: DefaultAvatar[] = [
    {
        id: 'avatar-01',
        name: 'Centinela Médico',
        filename: 'Avatars-01.svg',
        category: 'medico',
        description: 'Médico vigilante de primera línea'
    },
    {
        id: 'avatar-02',
        name: 'Investigadora Digital',
        filename: 'Avatars-02.svg',
        category: 'cientifico',
        description: 'Científica investigadora'
    },
    {
        id: 'avatar-03',
        name: 'Vigilante Info',
        filename: 'Avatars-03.svg',
        category: 'vigilante',
        description: 'Vigilante de la información'
    },
    {
        id: 'avatar-04',
        name: 'Epidemiólogo Voluntario',
        filename: 'Avatars-04.svg',
        category: 'cientifico',
        description: 'Epidemiólogo digital'
    },
    {
        id: 'avatar-05',
        name: 'Guardiana de Datos',
        filename: 'Avatars-05.svg',
        category: 'vigilante',
        description: 'Protectora de información'
    },
    {
        id: 'avatar-06',
        name: 'Analista Inmunológico',
        filename: 'Avatars-06.svg',
        category: 'cientifico',
        description: 'Especialista en inmunología informativa'
    },
    {
        id: 'avatar-07',
        name: 'Detective Digital',
        filename: 'Avatars-07.svg',
        category: 'personaje',
        description: 'Detective de desinformación'
    },
    {
        id: 'avatar-08',
        name: 'Centinela Urbano',
        filename: 'Avatars-08.svg',
        category: 'vigilante',
        description: 'Vigía urbano contra la desinformación'
    },
    {
        id: 'avatar-09',
        name: 'Científico de Datos',
        filename: 'Avatars-09.svg',
        category: 'cientifico',
        description: 'Experto en análisis de datos'
    },
    {
        id: 'avatar-10',
        name: 'Guardián Comunitario',
        filename: 'Avatars-10.svg',
        category: 'personaje',
        description: 'Protector de la comunidad'
    },
    {
        id: 'avatar-11',
        name: 'Investigador Forense',
        filename: 'Avatars-11.svg',
        category: 'cientifico',
        description: 'Investigador forense digital'
    },
    {
        id: 'avatar-12',
        name: 'Especialista',
        filename: 'Avatars-12.svg',
        category: 'medico',
        description: 'Especialista en salud informativa'
    },
    {
        id: 'avatar-13',
        name: 'Agente Verificador',
        filename: 'Avatars-13.svg',
        category: 'personaje',
        description: 'Agente de verificación'
    }
];
