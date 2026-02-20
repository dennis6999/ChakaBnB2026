import React from 'react';

/** Generic shimmer skeleton block */
const Shimmer = ({ className = '' }) => (
    <div className={`bg-stone-200 rounded-xl animate-pulse ${className}`} />
);

/** Skeleton for a search result list card */
export function SearchResultSkeleton() {
    return (
        <div className="bg-white border border-stone-200 rounded-3xl p-4 flex flex-col md:flex-row gap-6 shadow-sm">
            <Shimmer className="w-full md:w-72 h-64 md:h-52 flex-shrink-0 rounded-2xl" />
            <div className="flex-1 py-2 space-y-3">
                <Shimmer className="h-4 w-24" />
                <Shimmer className="h-7 w-2/3" />
                <Shimmer className="h-4 w-1/3" />
                <Shimmer className="h-16 w-full" />
                <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                    <Shimmer className="h-8 w-32" />
                    <Shimmer className="h-11 w-32 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

/** Skeleton for a grid property card */
export function PropertyCardSkeleton() {
    return (
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-sm">
            <Shimmer className="h-64 w-full rounded-none" />
            <div className="p-6 space-y-3">
                <Shimmer className="h-6 w-3/4" />
                <Shimmer className="h-4 w-1/2" />
                <div className="pt-4 border-t border-stone-100 flex justify-between">
                    <Shimmer className="h-6 w-24" />
                    <Shimmer className="h-5 w-16" />
                </div>
            </div>
        </div>
    );
}

/** Skeleton for property detail page */
export function PropertyDetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 pt-6 animate-pulse">
            <Shimmer className="h-5 w-40 mb-6" />
            <Shimmer className="h-10 w-2/3 mb-4" />
            <Shimmer className="h-4 w-1/3 mb-8" />
            <Shimmer className="h-[50vh] w-full rounded-3xl mb-12" />
            <div className="flex gap-12">
                <div className="flex-1 space-y-4">
                    <Shimmer className="h-6 w-1/2" />
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-5/6" />
                    <Shimmer className="h-4 w-4/6" />
                </div>
                <Shimmer className="w-96 h-96 flex-shrink-0 rounded-3xl" />
            </div>
        </div>
    );
}

/** Skeleton for the entire page (used in App loading state) */
export function SkeletonPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex flex-col">
            <div className="h-[72px] bg-white border-b border-stone-200 flex flex-col justify-center px-4 animate-pulse">
                <div className="flex justify-between items-center">
                    <Shimmer className="h-8 w-32 rounded-lg" />
                    <Shimmer className="h-10 w-24 rounded-full" />
                </div>
            </div>
            <div className="flex-1 p-4 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
                <Shimmer className="h-12 w-64 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                    <PropertyCardSkeleton />
                </div>
            </div>
        </div>
    );
}

