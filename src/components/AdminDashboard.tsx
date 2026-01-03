import React from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Loader2, Activity, Users, FileText, Vote, RefreshCw, Trophy, UserCog } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CreateChallengeForm from './CreateChallengeForm';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';
import { RoleManagementTab } from './RoleManagementTab';

export default function AdminDashboard() {
    const { overview, macros, activeTab, setActiveTab, isLoading, error, refresh } = useAdminDashboard();

    const handleTabChange = (value: string) => {
        setActiveTab(value as 'overview' | 'macros' | 'challenges' | 'gestion-roles');
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Franja de Botilito - Admin Style */}
            <div className="bg-[#e0e7ff] border-2 border-[#4f46e5] rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-4">
                    <img
                        src={botilitoImage}
                        alt="Botilito Admin"
                        className="w-24 h-24 object-contain mt-[0px] mr-[16px] mb-[-18px] ml-[0px]"
                    />
                    <div className="flex-1">
                        <p className="text-xl text-[#312e81] font-bold">
                            Panel de Control Maestro 🛠️
                        </p>
                        <p className="text-sm mt-1 opacity-80 text-[#4338ca]">
                            Gestión centralizada de usuarios, análisis y métricas del sistema.
                        </p>
                    </div>
                    <Button onClick={refresh} variant="ghost" disabled={isLoading} className="text-[#312e81] hover:bg-[#c7d2fe]">
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Actualizar Datos
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                    Error: {error}
                </div>
            )}

            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
                <TabsList className="bg-slate-100 p-1">
                    <TabsTrigger value="overview">Resumen General</TabsTrigger>
                    <TabsTrigger value="macros">Tendencias (Macros)</TabsTrigger>
                    <TabsTrigger value="challenges" className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-amber-500" />
                        Misiones
                    </TabsTrigger>
                    <TabsTrigger value="gestion-roles" className="flex items-center gap-2">
                        <UserCog className="h-4 w-4 text-indigo-500" />
                        Gestión de Roles
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    {isLoading && !overview ? (
                        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
                    ) : overview ? (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Casos</CardTitle>
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.overview.total_cases}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.overview.total_users}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.overview.total_documents}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Total Votos</CardTitle>
                                        <Vote className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.overview.total_votes || 0}</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">Interacciones</CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">{overview.overview.total_interactions}</div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Usuarios Top (Correlación)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(overview.correlations?.top_active_users || []).map((user) => (
                                            <div key={user.user_id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">Usuario: {user.user_id.substring(0, 8)}...</p>
                                                    <p className="text-xs text-muted-foreground">Acciones: {user.total_actions}</p>
                                                </div>
                                                <div className="flex space-x-4 text-sm">
                                                    <div>🗳️ {user.breakdown.votes || 0}</div>
                                                    <div>🚩 {user.breakdown.reports || 0}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!overview.correlations?.top_active_users || overview.correlations.top_active_users.length === 0) && (
                                            <p className="text-muted-foreground text-sm">No hay datos de correlación disponibles.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    ) : null}
                </TabsContent>

                <TabsContent value="macros" className="space-y-4">
                    {isLoading && !macros ? (
                        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>
                    ) : macros ? (
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card className="col-span-2">
                                <CardHeader>
                                    <CardTitle>Actividad (Últimos {macros.period})</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={macros.charts.activity_trend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                            />
                                            <YAxis />
                                            <RechartsTooltip
                                                labelFormatter={(label) => new Date(label).toLocaleDateString('es-ES')}
                                            />
                                            <Bar dataKey="votes" name="Votos" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="cases" name="Casos" fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Segmentación de Usuarios</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span>Newbie</span>
                                            <span className="font-bold">{macros.charts.user_segments.newbie}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Expert</span>
                                            <span className="font-bold">{macros.charts.user_segments.expert}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>Master</span>
                                            <span className="font-bold">{macros.charts.user_segments.master}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : null}
                </TabsContent>

                <TabsContent value="challenges" className="space-y-4">
                    <CreateChallengeForm />
                </TabsContent>

                <TabsContent value="gestion-roles" className="space-y-4">
                    <RoleManagementTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
