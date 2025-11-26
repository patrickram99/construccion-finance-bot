"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  type: "gasto" | "ingreso"
  date: string
}

interface ExpenseChartsProps {
  transactions: Transaction[]
}

// Category labels for display
const CATEGORY_LABELS: Record<string, string> = {
  comida: "Comida",
  diversión: "Diversión",
  diversion: "Diversión",
  ropa: "Ropa",
  transporte: "Transporte",
  salud: "Salud",
  vivienda: "Vivienda",
  servicios: "Servicios",
  educación: "Educación",
  educacion: "Educación",
  ahorro: "Ahorro",
  otros: "Otros",
  salario: "Salario",
  freelance: "Freelance",
  regalos: "Regalos",
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1", "#84cc16", "#f97316"]

// Helper to format currency
function formatCurrency(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function ExpenseCharts({ transactions }: ExpenseChartsProps) {
  const categoryData = useMemo(() => {
    const gastos = transactions.filter((t) => t.type === "gasto")
    const grouped: Record<string, number> = {}

    gastos.forEach((t) => {
      const cat = t.category?.toLowerCase() || "otros"
      const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount
      grouped[cat] = (grouped[cat] || 0) + amount
    })

    return Object.entries(grouped).map(([key, value]) => ({
      name: CATEGORY_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1),
      value: Math.round(value * 100) / 100,
    }))
  }, [transactions])

  const dailyData = useMemo(() => {
    const daily: Record<string, { gastos: number; ingresos: number }> = {}

    transactions.forEach((t) => {
      const date = new Date(t.date).toLocaleDateString("es-PE")
      const amount = typeof t.amount === "string" ? parseFloat(t.amount) : t.amount
      if (!daily[date]) {
        daily[date] = { gastos: 0, ingresos: 0 }
      }
      if (t.type === "gasto") {
        daily[date].gastos += amount
      } else {
        daily[date].ingresos += amount
      }
    })

    return Object.entries(daily)
      .map(([date, data]) => ({
        date,
        gastos: Math.round(data.gastos * 100) / 100,
        ingresos: Math.round(data.ingresos * 100) / 100,
      }))
      .sort((a, b) => {
        const [dayA, monthA, yearA] = a.date.split("/").map(Number)
        const [dayB, monthB, yearB] = b.date.split("/").map(Number)
        return new Date(yearA, monthA - 1, dayA).getTime() - new Date(yearB, monthB - 1, dayB).getTime()
      })
  }, [transactions])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Gastos por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Daily Trend */}
      {dailyData.length > 0 && (
        <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Tendencia Diaria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="date" stroke="currentColor" opacity={0.5} fontSize={12} />
              <YAxis stroke="currentColor" opacity={0.5} fontSize={12} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
              />
              <Legend />
              <Line type="monotone" dataKey="ingresos" stroke="#10b981" name="Ingresos" strokeWidth={2} />
              <Line type="monotone" dataKey="gastos" stroke="#ef4444" name="Gastos" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  )
}
