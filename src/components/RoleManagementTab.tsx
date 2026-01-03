import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Loader2, Shield, UserCog, AlertCircle, CheckCircle } from 'lucide-react';
import { getRolesConfig, updateUserRole } from '@/services/roleService';
import { RoleDefinition } from '@/types/roles';
import { useToast } from '@/hooks/use-toast';

export function RoleManagementTab() {
    const [roles, setRoles] = useState<Record<string, RoleDefinition>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    // Form State
    const [email, setEmail] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const config = await getRolesConfig();
            setRoles(config.roles);
        } catch (err: any) {
            console.error('Error loading roles:', err);
            setError(err.message || 'Error al cargar la configuración de roles');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !selectedRole) {
            toast({
                title: "Error",
                description: "Por favor ingrese un email y seleccione un rol.",
                variant: "destructive"
            });
            return;
        }

        setIsUpdating(true);
        try {
            await updateUserRole({ email, new_role: selectedRole });
            toast({
                title: "Rol Actualizado",
                description: `El usuario ${email} ahora tiene el rol: ${roles[selectedRole]?.name || selectedRole}`,
                variant: 'default', // Using default/success style if available, Shadcn usually uses default or destructive
            });
            setEmail('');
            setSelectedRole('');
        } catch (err: any) {
            console.error('Error updating role:', err);
            toast({
                title: "Error al actualizar",
                description: err.message || "No se pudo actualizar el rol.",
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading && Object.keys(roles).length === 0) {
        return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
                <Button variant="outline" size="sm" onClick={loadRoles} className="ml-auto">Reintentar</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Assign Role Form */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-indigo-600" />
                            Asignar o Cambiar Rol
                        </CardTitle>
                        <CardDescription>
                            Actualiza el rol de un usuario existente ingresando su correo electrónico.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleUpdateRole} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Correo Electrónico del Usuario</label>
                                <Input
                                    type="email"
                                    placeholder="usuario@ejemplo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Seleccionar Nuevo Rol</label>
                                <Select value={selectedRole} onValueChange={setSelectedRole} required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un rol..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(roles).map(([slug, def]) => (
                                            <SelectItem key={slug} value={slug}>
                                                {def.name} ({def.level})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Actualizar Rol
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Roles Reference List */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-emerald-600" />
                            Roles Disponibles en el Sistema
                        </CardTitle>
                        <CardDescription>
                            Lista de roles y sus niveles de acceso configurados actualmente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(roles).map(([slug, def]) => (
                                <div key={slug} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-slate-800">{def.name}</span>
                                            <Badge variant="secondary" className="text-xs bg-slate-200 text-slate-700">
                                                {def.level}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-slate-500">{def.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Permissions Table (Optional, expanding on the spec) */}
            <Card>
                <CardHeader>
                    <CardTitle>Detalle de Permisos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Rol</TableHead>
                                <TableHead>Nivel</TableHead>
                                <TableHead>Permisos Incluidos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(roles).map(([slug, def]) => (
                                <TableRow key={slug}>
                                    <TableCell className="font-medium">{def.name}</TableCell>
                                    <TableCell>{def.level}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {def.permissions ? Object.keys(def.permissions).map(perm => (
                                                <Badge key={perm} variant="outline" className="text-[10px] border-indigo-100 bg-indigo-50 text-indigo-700">
                                                    {perm}
                                                </Badge>
                                            )) : <span className="text-xs text-muted-foreground">Sin permisos específicos definidos</span>}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
