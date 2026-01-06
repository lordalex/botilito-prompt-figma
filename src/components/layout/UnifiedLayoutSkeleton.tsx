import React, { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import botilitoImage from 'figma:asset/e27a276e6ff0e187a67cf54678c265c1c38adbf7.png';

/**
 * Props for the UnifiedLayoutSkeleton component.
 * This provides a consistent layout skeleton that can be filled with different
 * content based on context (AI Analysis, Human Diagnosis, Historial).
 */
interface UnifiedLayoutSkeletonProps {
    /** Header message displayed in the yellow Botilito banner */
    headerMessage?: string;

    /** Whether to show the back button */
    showBackButton?: boolean;

    /** Callback when back button is clicked */
    onBack?: () => void;

    /** Visual preview slot (screenshot, image, etc.) */
    visualPreview?: ReactNode;

    /** Title of the content being analyzed */
    title?: string;

    /** Subtitle/description below the title */
    subtitle?: ReactNode;

    /** Verdict cards slot (AI Score, Human Score) */
    verdictCards?: ReactNode;

    /** Main content area (swappable: TextAIAnalysis, HumanDiagnosisTab, etc.) */
    mainContent: ReactNode;

    /** Sidebar content (case info, stats, recommendations) */
    sidebar: ReactNode;

    /** Optional footer content */
    footer?: ReactNode;

    /** Whether the view is in loading state */
    isLoading?: boolean;

    /** Loading component to show when isLoading is true */
    loadingContent?: ReactNode;
}

/**
 * UnifiedLayoutSkeleton - A consistent layout skeleton for all analysis views.
 * 
 * This component provides fixed layout zones that can be filled with different
 * content based on the context (Analysis Results, Human Diagnosis, Historial).
 * 
 * Layout Structure:
 * - Header Banner (Yellow Botilito)
 * - Back Navigation
 * - Visual Preview (Screenshot/Image)
 * - Title + Badges
 * - Verdict Cards (AI/Human scores)
 * - 2-Column Layout: Main Content + Sidebar
 * - Footer
 */
export function UnifiedLayoutSkeleton({
    headerMessage = "Revisa este caso y dame tu opinión. ¡Tu validación me ayuda a mejorar! 🐤",
    showBackButton = true,
    onBack,
    visualPreview,
    title,
    subtitle,
    verdictCards,
    mainContent,
    sidebar,
    footer,
    isLoading,
    loadingContent
}: UnifiedLayoutSkeletonProps) {

    // Show loading state if provided
    if (isLoading && loadingContent) {
        return (
            <div className="min-h-screen bg-slate-50">
                {loadingContent}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* HEADER BANNER - Yellow Botilito message                         */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-[#FFE97A] border-b-2 border-[#FFD700]">
                <div className="max-w-[1400px] mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <img
                            src={botilitoImage}
                            alt="Botilito"
                            className="w-12 h-12 object-contain"
                        />
                        <p className="text-base font-medium text-slate-800">
                            {headerMessage}
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MAIN CONTAINER                                                   */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

                {/* Back Navigation */}
                {showBackButton && onBack && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onBack}
                        className="text-slate-600 hover:text-slate-900 -ml-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al listado
                    </Button>
                )}

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* 2-COLUMN LAYOUT: Main + Sidebar                              */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* ─────────────────────────────────────────────────────── */}
                    {/* MAIN COLUMN (8 cols)                                     */}
                    {/* ─────────────────────────────────────────────────────── */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Visual Preview (Screenshot/Image) */}
                        {visualPreview && (
                            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                {visualPreview}
                            </div>
                        )}

                        {/* Title Section */}
                        {title && (
                            <div className="space-y-2">
                                <h1 className="text-xl font-bold text-slate-900">
                                    {title}
                                </h1>
                                {subtitle && (
                                    <div className="text-sm text-slate-600">
                                        {subtitle}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Verdict Cards (AI Score + Human Score) */}
                        {verdictCards && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {verdictCards}
                            </div>
                        )}

                        {/* Main Content Area (Swappable) */}
                        <div className="space-y-6">
                            {mainContent}
                        </div>
                    </div>

                    {/* ─────────────────────────────────────────────────────── */}
                    {/* SIDEBAR COLUMN (4 cols)                                  */}
                    {/* ─────────────────────────────────────────────────────── */}
                    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6 lg:self-start">
                        {sidebar}
                    </div>
                </div>

                {/* Footer */}
                {footer && (
                    <div className="pt-8 border-t border-slate-200">
                        {footer}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* GLOBAL FOOTER                                                    */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="text-center py-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium">
                    Botilito Intelligence Ecosystem • {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
