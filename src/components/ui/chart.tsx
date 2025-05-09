"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"]
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || item.payload.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          }
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: React.ComponentProps<"div"> &
  Pick<RechartsPrimitive.LegendProps, "payload" | "verticalAlign"> & {
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}
    >
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// Add these imports at the top with the other imports
import {
  Bar,
  Line,
  BarChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  Tooltip
} from "recharts"

// Update the ChartProps type to accept both data formats
type ChartProps = {
  type: 'bar' | 'line' | 'area'
  data: Array<Record<string, any>> | {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      [key: string]: any
    }>
  }
  title?: string
  className?: string
  color?: string
  xAxisKey?: string
  yAxisKey?: string
}

// Add this helper function to transform Chart.js format data to Recharts format
function transformChartData(
  data: ChartProps['data'],
  xAxisKey: string,
  yAxisKey: string
): Array<Record<string, any>> {
  if (Array.isArray(data)) {
    return data; // Already in the right format
  }
  
  // Transform from Chart.js format to Recharts format
  return data.labels.map((label, index) => {
    const result: Record<string, any> = {
      [xAxisKey]: label
    };
    
    // Add each dataset's value for this index
    data.datasets.forEach((dataset, datasetIndex) => {
      const key = dataset.label || `dataset_${datasetIndex}`;
      result[key] = dataset.data[index];
    });
    
    return result;
  });
}

function Chart({
  type,
  data,
  title,
  className,
  color = 'primary',
  xAxisKey = 'name',
  yAxisKey = 'value'
}: ChartProps) {
  // Define chart config for colors
  const chartConfig = {
    [yAxisKey]: {
      label: title,
      color: getColorByName(color)
    }
  }
  
  // Transform data if needed
  const transformedData = transformChartData(data, xAxisKey, yAxisKey);
  
  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
            <BarChart data={transformedData}>
              <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
              <YAxis hide />
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <Bar dataKey={yAxisKey} fill={`var(--color-${yAxisKey})`} radius={[4, 4, 0, 0]} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </BarChart>
          </RechartsPrimitive.ResponsiveContainer>
        );
      
      case 'line':
        return (
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
            <LineChart data={transformedData}>
              <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
              <YAxis hide />
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <Line
                type="monotone"
                dataKey={yAxisKey}
                stroke={`var(--color-${yAxisKey})`}
                strokeWidth={2}
                dot={{ fill: `var(--color-${yAxisKey})`, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </LineChart>
          </RechartsPrimitive.ResponsiveContainer>
        );
        
      case 'area':
        return (
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
            <AreaChart data={transformedData}>
              <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} />
              <YAxis hide />
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.2} />
              <Area 
                type="monotone" 
                dataKey={yAxisKey} 
                stroke={`var(--color-${yAxisKey})`}
                fill={`var(--color-${yAxisKey})`}
                fillOpacity={0.2}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
            </AreaChart>
          </RechartsPrimitive.ResponsiveContainer>
        );
        
      default:
        // Provide a fallback element instead of null
        return (
          <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No chart type specified
            </div>
          </RechartsPrimitive.ResponsiveContainer>
        );
    }
  };

  return (
    <ChartContainer config={chartConfig} className={className}>
      {renderChart()}
    </ChartContainer>
  );
}

// Helper function to get color values based on common color names
function getColorByName(colorName: string): string {
  const colors: Record<string, string> = {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    indigo: '#6366f1',
    emerald: '#10b981',
    green: '#22c55e',
    red: '#ef4444',
    blue: '#3b82f6',
    teal: '#14b8a6',
    gray: '#6b7280',
    amber: '#f59e0b'
  }
  
  return colors[colorName] || colors.primary
}

/**
 * Helper function to get the configuration for a payload item from the chart config
 */
function getPayloadConfigFromPayload(
  config: ChartConfig,
  item: any,
  key: string
) {
  // Try to find config by dataKey first
  const itemConfig = config[key] || 
    // Then by name
    config[item?.name as keyof typeof config] ||
    // Then by dataKey if different from key
    (item?.dataKey && item.dataKey !== key ? config[item.dataKey as keyof typeof config] : undefined)

  return itemConfig
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  Chart
}
