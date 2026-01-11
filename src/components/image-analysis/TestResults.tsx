import React from 'react';
import { Level1AnalysisItem } from '@/types/imageAnalysis';
import { ForensicTestCard } from './ForensicTestCard';
import { transformTestResults } from './forensicTestDefinitions';

interface Props {
    tests: Level1AnalysisItem[];
}

export function TestResults({ tests }: Props) {
    // Transform Level1AnalysisItem data to ForensicTest format
    const forensicTests = transformTestResults(tests);

    return (
        <div className="space-y-4">
            {forensicTests.map((test) => (
                <ForensicTestCard key={test.id} test={test} />
            ))}
        </div>
    );
}
