
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableRow } from '../ui/table';
import type { Insight } from '../../services/imageAnalysisTypes';
import { formatBytes } from '../../lib/utils';

interface MetadataDisplayProps {
  insights: Insight[];
}

const METADATA_KEYS_TO_IGNORE = ['exif', 'mode', 'filename', 'mask', 'heatmap', 'original', 'description', 'value', 'type', 'algo'];


const EXIF_KEYS_TO_IGNORE = ['ExifOffset', 'UserComment'];

const getMetadataInsight = (insights: Insight[]) => {
    return insights.find(insight => insight.algo === 'Metadatos' && insight.type === 'metadata');
}

const MetadataDisplay: React.FC<MetadataDisplayProps> = ({ insights }) => {
    const metadataInsight = getMetadataInsight(insights);

    if (!metadataInsight) {
        return null;
    }

    const { data } = metadataInsight;
    const { exif, ...otherMetadata } = data;

    const renderValue = (key: string, value: any) => {
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        if (key === 'size_bytes' && typeof value === 'number') {
            return formatBytes(value);
        }
        if (typeof value === 'number') {
            return value.toFixed(2);
        }
        return value.toString();
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>File Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableBody>
                            {Object.entries(otherMetadata).filter(([key]) => !METADATA_KEYS_TO_IGNORE.includes(key)).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell className="font-medium">{key.replace(/_/g, ' ')}</TableCell>
                                    <TableCell>{renderValue(key, value)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {exif && Object.keys(exif).length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>EXIF Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                {Object.entries(exif).filter(([key]) => !EXIF_KEYS_TO_IGNORE.includes(key)).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="font-medium">{key}</TableCell>
                                        <TableCell>{value.toString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default MetadataDisplay;
