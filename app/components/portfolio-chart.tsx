"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const data = [
  { name: "يناير", value: 280000 },
  { name: "فبراير", value: 295000 },
  { name: "مارس", value: 310000 },
  { name: "أبريل", value: 305000 },
  { name: "مايو", value: 320000 },
  { name: "يونيو", value: 315000 },
  { name: "يوليو", value: 340000 },
  { name: "أغسطس", value: 335000 },
  { name: "سبتمبر", value: 350000 },
  { name: "أكتوبر", value: 345000 },
  { name: "نوفمبر", value: 360000 },
  { name: "ديسمبر", value: 373139 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/40 rounded-xl p-3 shadow-lg">
        <p className="text-xs text-muted-foreground mb-1">{payload[0].payload.name}</p>
        <p className="text-sm font-bold">
          {new Intl.NumberFormat("ar-DZ", {
            style: "currency",
            currency: "DZD",
            maximumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function PortfolioChart() {
  return (
    <div className="w-full h-[200px] sm:h-[240px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            interval={2}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
