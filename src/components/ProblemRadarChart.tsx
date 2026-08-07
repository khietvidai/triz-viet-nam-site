import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';

/**
 * Props for the ProblemRadarChart component.
 */
/**
 * Props for the ProblemRadarChart component.
 */
interface ProblemRadarChartProps {
    /** The current state score (0-100) */
    current?: number;
    /** The ideal state score (0-100) */
    ideal?: number;
    /** Localized labels for the chart */
    labels?: {
        currentState: string;
        idealState: string;
        subjects: {
            costEfficiency: string;
            durability: string;
            speed: string;
            simplicity: string;
        }
    }
}

/**
 * A radar chart visualizing the gap between the current problem state and the ideal final result.
 * Uses Recharts for rendering.
 */
export function ProblemRadarChart({
    current = 50,
    ideal = 95,
    labels = {
        currentState: "Current State",
        idealState: "Ideal State",
        subjects: {
            costEfficiency: "Cost Efficiency",
            durability: "Durability",
            speed: "Speed",
            simplicity: "Simplicity"
        }
    }
}: ProblemRadarChartProps) {
    // Simulate dynamic data based on input scores
    // Hardcoded colors should ideally come from a theme hook, but using standard Tailwind palette hexes here for Recharts compatibility
    const COLORS = {
        grid: 'rgba(255,255,255,0.1)',
        text: '#94a3b8', // slate-400
        current: '#ef4444', // red-500
        ideal: '#06b6d4', // cyan-500 (cyan-glow)
    };

    const chartData = [
        { subject: labels.subjects.costEfficiency, current: Math.min(current + 10, 100), ideal: ideal, fullMark: 100 },
        { subject: labels.subjects.durability, current: Math.min(current + 20, 100), ideal: Math.min(ideal + 3, 100), fullMark: 100 },
        { subject: labels.subjects.speed, current: Math.max(current - 10, 0), ideal: Math.max(ideal - 5, 0), fullMark: 100 },
        { subject: labels.subjects.simplicity, current: Math.max(current - 20, 0), ideal: Math.max(ideal - 10, 0), fullMark: 100 },
    ];

    return (
        <div className="w-full h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                    <PolarGrid stroke={COLORS.grid} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: COLORS.text, fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name={labels.currentState}
                        dataKey="current"
                        stroke={COLORS.current}
                        fill={COLORS.current}
                        fillOpacity={0.3}
                    />
                    <Radar
                        name={labels.idealState}
                        dataKey="ideal"
                        stroke={COLORS.ideal}
                        fill={COLORS.ideal}
                        fillOpacity={0.4}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
