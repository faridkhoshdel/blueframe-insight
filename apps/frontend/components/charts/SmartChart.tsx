"use client";

import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ScatterChart, Scatter, ComposedChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import { useColorTheme } from "@/lib/ColorThemeContext";

const DATA = [
  { name: "فروردین", فروش: 420, هزینه: 240 },
  { name: "اردیبهشت", فروش: 380, هزینه: 221 },
  { name: "خرداد", فروش: 510, هزینه: 229 },
  { name: "تیر", فروش: 470, هزینه: 200 },
  { name: "مرداد", فروش: 590, هزینه: 218 },
  { name: "شهریور", فروش: 630, هزینه: 250 },
];

const c = (i: number) => `var(--chart-${i + 1})`;
const axis = { stroke: "var(--text-secondary)", fontSize: 11 };

export default function SmartChart({ height = 260 }: { height?: number }) {
  const { settings } = useColorTheme();
  const t = settings.chartType;

  const grid = <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />;
  const axes = (
    <>
      <XAxis dataKey="name" tick={axis} stroke="var(--border-color)" />
      <YAxis tick={axis} stroke="var(--border-color)" />
    </>
  );
  const tip = <Tooltip contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 12, color: "var(--text-primary)" }} />;

  return (
    <div dir="ltr" style={{ width: "100%", height }}>
      <ResponsiveContainer>
        {t === "line" ? (
          <LineChart data={DATA}>{grid}{axes}{tip}<Legend />
            <Line type="monotone" dataKey="فروش" stroke={c(0)} strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="هزینه" stroke={c(1)} strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        ) : t === "area" ? (
          <AreaChart data={DATA}>{grid}{axes}{tip}<Legend />
            <Area type="monotone" dataKey="فروش" stroke={c(0)} fill={c(0)} fillOpacity={0.3} />
            <Area type="monotone" dataKey="هزینه" stroke={c(4)} fill={c(4)} fillOpacity={0.3} />
          </AreaChart>
        ) : t === "bar" ? (
          <BarChart data={DATA}>{grid}{axes}{tip}<Legend />
            <Bar dataKey="فروش" fill={c(0)} radius={[8, 8, 0, 0]} />
            <Bar dataKey="هزینه" fill={c(2)} radius={[8, 8, 0, 0]} />
          </BarChart>
        ) : t === "pie" ? (
          <PieChart><Pie data={DATA} dataKey="فروش" nameKey="name" outerRadius="80%" label>
            {DATA.map((_, i) => <Cell key={i} fill={c(i % 6)} />)}
          </Pie>{tip}<Legend /></PieChart>
        ) : t === "donut" ? (
          <PieChart><Pie data={DATA} dataKey="فروش" nameKey="name" innerRadius="45%" outerRadius="80%" label>
            {DATA.map((_, i) => <Cell key={i} fill={c(i % 6)} />)}
          </Pie>{tip}<Legend /></PieChart>
        ) : t === "radar" ? (
          <RadarChart data={DATA}><PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="name" tick={axis} />
            <Radar name="فروش" dataKey="فروش" stroke={c(0)} fill={c(0)} fillOpacity={0.4} />
            <Radar name="هزینه" dataKey="هزینه" stroke={c(3)} fill={c(3)} fillOpacity={0.3} />
            {tip}<Legend />
          </RadarChart>
        ) : t === "scatter" ? (
          <ScatterChart>{grid}{axes}{tip}<Legend />
            <Scatter name="فروش" dataKey="فروش" fill={c(0)} />
            <Scatter name="هزینه" dataKey="هزینه" fill={c(5)} />
          </ScatterChart>
        ) : (
          <ComposedChart data={DATA}>{grid}{axes}{tip}<Legend />
            <Bar dataKey="هزینه" fill={c(2)} radius={[8, 8, 0, 0]} />
            <Line type="monotone" dataKey="فروش" stroke={c(0)} strokeWidth={3} />
          </ComposedChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
