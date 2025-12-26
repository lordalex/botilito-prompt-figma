const mockApiResult = {
    "status": "completed",
    "result": {
        "source_data": {
            "url": "https://apnews.com/article/yemen-houthi-ship-attacks-missile-a4c3e8...",
            "hostname": "apnews.com",
            "title": "Houthi missile hits US-owned ship off Yemen",
            "text": "A missile fired by Yemen's Houthi rebels hit a U.S.-owned cargo ship on Monday...",
            "vector_de_transmision": "Web"
        },
        "search_context": [
            {
                "title": "Centcom confirms Houthi attack on US ship",
                "href": "https://www.centcom.mil/MEDIA/PRESS-RELEASES/...",
                "body": "TAMPA, Fla. – On Jan. 15, at approximately 4 p.m. (Sanaa time)..."
            }
        ],
        "ai_analysis": {
            "classification": {
                "indiceCumplimientoAMI": {
                    "score": 95,
                    "nivel": "Fully AMI Compliant"
                },
                "criterios": {
                    "1": {
                        "nombre": "Claridad de la fuente",
                        "score": 1,
                        "justificacion": "La noticia proviene de AP News, una fuente reconocida con atribución clara.",
                        "evidencias": ["AP News", "Monday"],
                        "cita": "Identificar quién comunica y con qué propósito es una competencia central...",
                        "referencia": "UNESCO, Media and Information Literacy Curriculum for Teachers, 2011."
                    },
                    "2": {
                        "nombre": "Trazabilidad de la información",
                        "score": 1,
                        "justificacion": "Se cita directamente a funcionarios de EE.UU. y se describe el evento con precisión.",
                        "evidencias": ["officials said", "tracked the missile"],
                        "cita": "Los ciudadanos deben ser capaces de rastrear la información...",
                        "referencia": "UNESCO, Global Media and Information Literacy Assessment Framework, 2013."
                    }
                    // ... other 18 criteria would be here
                },
                "recomendaciones": [
                    "Consultar comunicados oficiales del Mando Central de EE.UU. para detalles técnicos.",
                    "Monitorear agencias de noticias internacionales para obtener diferentes ángulos del conflicto."
                ]
            },
            "summaries": {
                "headline": "Ataque Houthi a buque estadounidense en Yemen confirmado",
                "summary": "AP News reporta que un misil Houthi impactó un carguero de propiedad estadounidense. El ataque fue confirmado por fuentes militares y no causó heridos graves.",
                "theme": "Internacional",
                "region": "África / Medio Oriente",
                "source": "AP News",
                "confidence": 0.98
            },
            "diagnosticoAMI": "El contenido presenta una alta adherencia a los estándares AMI, con fuentes trazables y lenguaje neutral."
        },
        "evidence": {
            "fact_check_table": [
                {
                    "claim": "Un misil Houthi impactó un buque de EE.UU.",
                    "verdict": "Verdadero",
                    "explanation": "Confirmado por el Mando Central de EE.UU. y múltiples agencias."
                }
            ]
        }
    }
};

// Mock transform function (matching the one in service)
function transformTextAnalysisToUI(apiResult, jobId, userId, reward) {
    const result = apiResult.result || apiResult;
    const { source_data = {}, search_context = [], ai_analysis = {} } = result;
    const { classification = {}, summaries = {} } = ai_analysis;
    const { indiceCumplimientoAMI = {}, criterios = {}, recomendaciones = [] } = classification;

    const credibilityScore = indiceCumplimientoAMI.score !== undefined
        ? indiceCumplimientoAMI.score
        : (summaries.confidence !== undefined ? Math.round(summaries.confidence * 100) : 0);

    const markersDetected = [];
    Object.entries(criterios).forEach(([id, data]) => {
        if (data.score < 1) {
            markersDetected.push({
                type: data.nombre || `Criterio ${id}`,
                explanation: data.justificacion || `Cumplimiento parcial/nulo: ${data.nombre}`
            });
        }
    });

    const nivel = indiceCumplimientoAMI.nivel || 'N/A';
    if (nivel === 'Fully AMI Compliant') {
        markersDetected.unshift({ type: 'Verdadero', explanation: 'Contenido que cumple con los estándares AMI.' });
    }

    const theme = summaries.theme || 'General';
    const region = summaries.region || 'Internacional';
    const reasoning = ai_analysis.diagnosticoAMI || summaries.summary || '';

    return {
        title: summaries.headline || source_data.title || 'Análisis AMI',
        summaryBotilito: {
            summary: summaries.summary || reasoning,
            diagnosticoAMI: ai_analysis.diagnosticoAMI
        },
        theme,
        region,
        caseNumber: 'WE-TX-IN-IN-ABC', // Hardcoded for test
        finalVerdict: nivel,
        markersDetected,
        fullResult: {
            metadata: {
                ami_assessment: {
                    ica: indiceCumplimientoAMI,
                    criterios,
                    recomendaciones
                }
            }
        }
    };
}

const uiResult = transformTextAnalysisToUI(mockApiResult, 'abc-123', 'user-1');
console.log(JSON.stringify(uiResult, null, 2));
