import { useState, useEffect, useCallback } from 'react';
import { fetchVerificationSummary, fetchCaseDetails, fetchVerifiedCasesForImmunization, generateDisplayId } from '../utils/humanVerification/api';
import { submitImmunizationStrategy } from '../services/immunizationService';
import { CaseEnriched } from '../utils/humanVerification/types';

export interface Vaccine {
    id: string;
    name: string;
    description: string;
    supports: VaccineSupport[];
}

export interface VaccineSupport {
    id: string;
    title: string;
    url: string;
}

export const useImmunizationStudio = () => {
    const [selectedContent, setSelectedContent] = useState<string | null>(null);
    const [selectedCaseDetail, setSelectedCaseDetail] = useState<CaseEnriched | null>(null);
    const [vaccines, setVaccines] = useState<Vaccine[]>([]);

    // Form States
    const [newVaccineName, setNewVaccineName] = useState('');
    const [newVaccineDescription, setNewVaccineDescription] = useState('');
    const [newSupportTitle, setNewSupportTitle] = useState('');
    const [newSupportUrl, setNewSupportUrl] = useState('');
    const [editingVaccineId, setEditingVaccineId] = useState<string | null>(null);

    // Filter/Search States
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Data/UI States
    const [isLoading, setIsLoading] = useState(false);
    const [verifiedContents, setVerifiedContents] = useState<any[]>([]); // Using any for now to match component usage
    const casesPerPage = 10;

    // Load cases on mount
    useEffect(() => {
        const loadCases = async () => {
            setIsLoading(true);
            try {
                const summary = await fetchVerifiedCasesForImmunization(1, 100);
                const mappedCases = summary.cases
                    .map(c => ({
                        ...c,
                        displayId: generateDisplayId(c), // Use generated ID
                        type: c.submission_type || 'text',
                        votesCount: c.human_votes?.count || 0,
                        priority: 'medium',
                        verifiedBy: 'Red de Validación',
                        content: c.summary || '',
                        submittedAt: c.created_at,
                        aiAnalysis: {
                            summary: c.summary,
                            veracity: c.consensus?.state || 'Unknown',
                            detectedMarkers: c.diagnostic_labels || []
                        },
                        consensusMarkers: c.consensus?.final_labels || c.diagnostic_labels || [],
                        consensusPercentages: {}
                    }));
                setVerifiedContents(mappedCases);
            } catch (e) {
                console.error("Error loading cases", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadCases();
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedContent(null);
        setVaccines([]);
        setEditingVaccineId(null);
    }, []);

    // Fetch details when selecting a case
    useEffect(() => {
        if (!selectedContent) {
            setSelectedCaseDetail(null);
            setVaccines([]);
            setEditingVaccineId(null);
            return;
        }
        const loadDetail = async () => {
            setIsLoading(true);
            try {
                const detail = await fetchCaseDetails(selectedContent);
                const mappedDetail = {
                    ...detail,
                    displayId: generateDisplayId(detail),
                    type: detail.submission_type || 'text',
                    votesCount: detail.human_votes?.count || 0,
                    priority: 'medium',
                    verifiedBy: 'Red de Validación',
                    content: detail.summary || '',
                    submittedAt: detail.created_at,
                    source: detail.url ? { name: new URL(detail.url).hostname, url: detail.url } : undefined,
                    aiAnalysis: {
                        summary: detail.summary,
                        veracity: detail.consensus?.state || 'Unknown',
                        detectedMarkers: detail.diagnostic_labels || []
                    },
                    consensusMarkers: detail.consensus?.final_labels || detail.diagnostic_labels || [],
                    consensusPercentages: {} // Fixed type error
                };
                setSelectedCaseDetail(mappedDetail);
            } catch (e) {
                console.error("Error loading details", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadDetail();
    }, [selectedContent]);

    const addVaccine = useCallback(() => {
        if (!newVaccineName.trim() || !newVaccineDescription.trim()) return;

        const newVaccine: Vaccine = {
            id: `vaccine-${Date.now()}`,
            name: newVaccineName,
            description: newVaccineDescription,
            supports: []
        };

        setVaccines(prev => [...prev, newVaccine]);
        setNewVaccineName('');
        setNewVaccineDescription('');
        setEditingVaccineId(newVaccine.id);
    }, [newVaccineName, newVaccineDescription]);

    const removeVaccine = useCallback((vaccineId: string) => {
        setVaccines(prev => prev.filter(v => v.id !== vaccineId));
        if (editingVaccineId === vaccineId) {
            setEditingVaccineId(null);
        }
    }, [editingVaccineId]);

    const addSupport = useCallback((vaccineId: string) => {
        if (!newSupportTitle.trim() || !newSupportUrl.trim()) return;

        const newSupport: VaccineSupport = {
            id: `support-${Date.now()}`,
            title: newSupportTitle,
            url: newSupportUrl
        };

        setVaccines(prev => prev.map(v =>
            v.id === vaccineId
                ? { ...v, supports: [...v.supports, newSupport] }
                : v
        ));

        setNewSupportTitle('');
        setNewSupportUrl('');
    }, [newSupportTitle, newSupportUrl]);

    const removeSupport = useCallback((vaccineId: string, supportId: string) => {
        setVaccines(prev => prev.map(v =>
            v.id === vaccineId
                ? { ...v, supports: v.supports.filter(s => s.id !== supportId) }
                : v
        ));
    }, []);

    const saveImmunizationStrategy = async () => {
        if (!selectedCaseDetail || vaccines.length === 0) return;

        setIsLoading(true);
        try {
            for (const vaccine of vaccines) {
                const payload = {
                    case_id: selectedCaseDetail.id,
                    name: vaccine.name,
                    description: vaccine.description,
                    resources: vaccine.supports.map(s => ({
                        type: 'link' as const,
                        url: s.url,
                        title: s.title
                    }))
                };
                await submitImmunizationStrategy(payload);
            }

            alert('¡Berraco parcero! Tu estrategia de inmunización está más afilada que un bisturí 💉✨');
            setVaccines([]);
            setEditingVaccineId(null);
        } catch (e: any) {
            console.error(e);
            alert('Error guardando la estrategia: ' + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedContentData = selectedCaseDetail || verifiedContents.find(c => c.id === selectedContent);

    return {
        selectedContent,
        setSelectedContent,
        clearSelection,
        selectedCaseDetail,
        vaccines,
        newVaccineName,
        setNewVaccineName,
        newVaccineDescription,
        setNewVaccineDescription,
        newSupportTitle,
        setNewSupportTitle,
        newSupportUrl,
        setNewSupportUrl,
        editingVaccineId,
        setEditingVaccineId,
        selectedFilter,
        setSelectedFilter,
        searchTerm,
        setSearchTerm,
        currentPage,
        setCurrentPage,
        isLoading,
        verifiedContents,
        casesPerPage,
        addVaccine,
        removeVaccine,
        addSupport,
        removeSupport,
        saveImmunizationStrategy,
        selectedContentData
    };
};
