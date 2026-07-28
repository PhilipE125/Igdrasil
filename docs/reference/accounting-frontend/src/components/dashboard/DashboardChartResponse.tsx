import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ChartSpec } from "@/lib/uploadApi";

const PALETTE = [
  "hsl(142, 71%, 65%)", // green
  "hsl(0, 91%, 71%)",   // red
  "hsl(217, 91%, 68%)", // blue
  "hsl(48, 94%, 60%)",  // yellow
  "hsl(270, 76%, 70%)", // purple
  "hsl(28, 95%, 61%)",  // orange
  "hsl(160, 60%, 52%)", // teal
  "hsl(340, 82%, 72%)", // pink
  "hsl(199, 89%, 60%)", // sky
];

function buildConfig(
  series: { key: string; name?: string; color?: string }[],
): ChartConfig {
  const config: ChartConfig = {};
  series.forEach((s, i) => {
    config[s.key] = {
      label: s.name ?? s.key,
      color: s.color ?? PALETTE[i % PALETTE.length],
    };
  });
  return config;
}

interface Props {
  spec: ChartSpec;
}

export function DashboardChartResponse({ spec }: Props) {
  const { chart, title, data } = spec;

  const wrapper = (children: React.ReactNode) => (
    <Card className="mt-2 mb-1 shadow-sm">
      {title && (
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="px-4 pb-4 pt-0">{children}</CardContent>
    </Card>
  );

  if (chart === "bar" && spec.bars) {
    const config = buildConfig(spec.bars);
    return wrapper(
      <ChartContainer config={config} className="h-[220px] w-full">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={spec.xKey} tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} width={52} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {spec.bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={`var(--color-${bar.key})`}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>,
    );
  }

  if (chart === "line" && spec.lines) {
    const config = buildConfig(spec.lines);
    return wrapper(
      <ChartContainer config={config} className="h-[220px] w-full">
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey={spec.xKey} tickLine={false} axisLine={false} fontSize={11} />
          <YAxis tickLine={false} axisLine={false} width={52} fontSize={11} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          {spec.lines.map((line) => (
            <Line
              key={line.key}
              type="monotone"
              dataKey={line.key}
              stroke={`var(--color-${line.key})`}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ChartContainer>,
    );
  }

  if (chart === "pie") {
    const nameKey = spec.nameKey ?? "name";
    const valueKey = spec.valueKey ?? "value";
    const config: ChartConfig = {};
    data.forEach((item: Record<string, unknown>, i: number) => {
      const key = String(item[nameKey] ?? i);
      config[key] = { label: key, color: PALETTE[i % PALETTE.length] };
    });
    // Inject fill color into data for Cell rendering
    const coloredData = data.map((item: Record<string, unknown>, i: number) => ({
      ...item,
      fill: PALETTE[i % PALETTE.length],
    }));

    return wrapper(
      <ChartContainer config={config} className="h-[220px] w-full">
        <PieChart>
          <Pie
            data={coloredData}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="45%"
            outerRadius={80}
            innerRadius={40}
          />
          <ChartTooltip content={<ChartTooltipContent nameKey={nameKey} />} />
          <ChartLegend content={<ChartLegendContent nameKey={nameKey} />} />
        </PieChart>
      </ChartContainer>,
    );
  }

  if (chart === "table" && spec.columns) {
    return wrapper(
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {spec.columns.map((col) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row: Record<string, unknown>, ri: number) => (
              <TableRow key={ri}>
                {spec.columns!.map((col) => (
                  <TableCell key={col.key}>
                    {typeof row[col.key] === "number"
                      ? (row[col.key] as number).toLocaleString("sv-SE")
                      : String(row[col.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>,
    );
  }

  return null;
}
