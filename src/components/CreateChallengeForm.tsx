import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { adminService } from '../services/adminService';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateChallengeForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        badge_name: '',
        required_xp: 50,
        required_reputation: 10
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'required_xp' || name === 'required_reputation' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Include created_by placeholder or fetch actual user ID if available in context/service
            const payload = {
                ...formData,
                created_by: "00000000-0000-0000-0000-000000000000" // Placeholder as per API spec example
            };

            await adminService.executeAction('CREATE_CHALLENGE', payload);
            setSuccess('Misión creada exitosamente.');
            setFormData({
                title: '',
                description: '',
                badge_name: '',
                required_xp: 50,
                required_reputation: 10
            });
        } catch (err: any) {
            console.error("Failed to create challenge", err);
            setError(err.message || 'Error al crear la misión.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Crear Nueva Misión</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="flex items-center p-3 text-red-600 bg-red-50 rounded-md">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center p-3 text-green-600 bg-green-50 rounded-md">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            {success}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="title">Título de la Misión</Label>
                        <Input
                            id="title"
                            name="title"
                            required
                            placeholder="Ej. Súper Verificador"
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            placeholder="Describe el objetivo..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="badge_name">Nombre de Insignia (Badge ID)</Label>
                        <Input
                            id="badge_name"
                            name="badge_name"
                            required
                            placeholder="Ej. checker_master_v1"
                            value={formData.badge_name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="required_xp">XP Requerida</Label>
                            <Input
                                id="required_xp"
                                name="required_xp"
                                type="number"
                                required
                                min="0"
                                value={formData.required_xp}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="required_reputation">Reputación Requerida</Label>
                            <Input
                                id="required_reputation"
                                name="required_reputation"
                                type="number"
                                required
                                min="0"
                                value={formData.required_reputation}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Creando...' : 'Crear Misión'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
