
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TradeStatsPieChartProps {
  wins: number;
  losses: number;
}

export default function TradeStatsPieChart({ wins, losses }: TradeStatsPieChartProps) {
  const data = [
    { name: "Wins", value: wins },
    { name: "Losses", value: losses }
  ];

  const COLORS = ["#2ec27e", "#e01b24"];

  return (
    <div className="h-[170px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}`, 'Count']}
            contentStyle={{ 
              backgroundColor: "var(--background)", 
              borderColor: "var(--border)" 
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
