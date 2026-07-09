import type { ReactNode } from "react"

type ChartChildrenProps = {
  children: ReactNode
}

export const ResponsiveContainer = ({ children }: ChartChildrenProps) => {
  return <div className="w-full h-full">{children}</div>
}

export const RadarChart = ({ children }: ChartChildrenProps) => {
  return <div>{children}</div>
}

export const PolarGrid = () => {
  return null
}

export const PolarAngleAxis = () => {
  return null
}

export const PolarRadiusAxis = () => {
  return null
}

export const Radar = () => {
  return null
}

export const BarChart = ({ children }: ChartChildrenProps) => {
  return <div>{children}</div>
}

export const Bar = () => {
  return null
}

export const XAxis = () => {
  return null
}

export const YAxis = () => {
  return null
}

export const CartesianGrid = () => {
  return null
}

export const Tooltip = () => {
  return null
}

export const Legend = () => {
  return null
}
