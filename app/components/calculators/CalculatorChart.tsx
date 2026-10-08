'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { FV_COLOR_HEX } from '@/app/lib/fv/colors';

interface CalculatorChartProps {
  type: 'bar' | 'pie' | 'line';
  data: any[];
  dataKeys?: string[];
  colors?: string[];
  xAxisKey?: string;
}

// recharts needs literal colours: fv token values (tailwind.config.ts `fv`) + category colours.
const FV_NAVY = '#1E2C59';
const FV_LINE = '#E6ECF5';
const FV_MUTED = '#8A94A8';
const FV_SLATE = '#55627A';
const FV_WASH = '#F3F9FD';

// fv palette: brand blue, fv-navy, then the green / orange / red category colours.
const DEFAULT_COLORS = [FV_COLOR_HEX.blue.fg, FV_NAVY, FV_COLOR_HEX.green.fg, FV_COLOR_HEX.orange.fg, FV_COLOR_HEX.red.fg];

const TICK = { fill: FV_SLATE, fontSize: 12 };
const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: `1px solid ${FV_LINE}`,
  borderRadius: '8px',
  boxShadow: '0 10px 30px rgba(30, 44, 89, 0.06)',
  color: FV_NAVY,
};
const LEGEND_STYLE = { fontSize: 13, paddingTop: 8 };
// Y-axis ticks as en-IN compact amounts (5L, 1.2Cr) so large values are not clipped.
const COMPACT = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
const formatTick = (value: number) => COMPACT.format(value);

// Text stays navy/slate (fv-blue would be ~3.9:1 at 13–16px); only the marks carry the series colours.
// recharts' default pie label and legend text take the slice/series colour, hence these overrides.
const renderPieLabel = ({ x, y, textAnchor, name, percent }: PieLabelRenderProps) => (
  <text x={x} y={y} textAnchor={textAnchor} alignmentBaseline="middle" fill={FV_NAVY} className="recharts-pie-label-text">
    {`${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
  </text>
);
const formatLegend = (value: unknown) => <span style={{ color: FV_SLATE }}>{String(value)}</span>;

export default function CalculatorChart({
  type,
  data,
  dataKeys = [],
  colors = DEFAULT_COLORS,
  xAxisKey = 'name',
}: CalculatorChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(
      chartRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    );
  }, [data]);

  return (
    <div ref={chartRef} className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' && (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={FV_LINE} />
            <XAxis dataKey={xAxisKey} stroke={FV_MUTED} tick={TICK} />
            <YAxis stroke={FV_MUTED} tick={TICK} tickFormatter={formatTick} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: FV_WASH }} />
            <Legend wrapperStyle={LEGEND_STYLE} formatter={formatLegend} />
            {dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index % colors.length]}
                radius={[8, 8, 0, 0]}
              />
            ))}
          </BarChart>
        )}

        {type === 'pie' && (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderPieLabel}
              outerRadius={120}
              fill={DEFAULT_COLORS[0]}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        )}

        {type === 'line' && (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={FV_LINE} />
            <XAxis dataKey={xAxisKey} stroke={FV_MUTED} tick={TICK} />
            <YAxis stroke={FV_MUTED} tick={TICK} tickFormatter={formatTick} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Legend wrapperStyle={LEGEND_STYLE} formatter={formatLegend} />
            {dataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
