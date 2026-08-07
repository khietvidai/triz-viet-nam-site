import React from 'react';

interface ResultCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export function ResultCard({ title, children, className = "" }: ResultCardProps) {
    return (
        <div className={`border rounded-2xl p-8 transition-colors ${className || 'border-gray-200 bg-white shadow-sm'}`}>
            <h3 className="font-bold text-gray-900 mb-4 text-lg">{title}</h3>
            {children}
        </div>
    );
}
