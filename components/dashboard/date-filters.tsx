"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DateRange {
  from: Date
  to: Date
}

interface DateFiltersProps {
  onDateRangeChange: (range: DateRange | null) => void
}

export function DateFilters({ onDateRangeChange }: DateFiltersProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customRange, setCustomRange] = useState<DateRange | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const handlePreset = (preset: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    let from = new Date(today)
    const to = new Date(today)
    to.setHours(23, 59, 59, 999)

    switch (preset) {
      case "today":
        break
      case "week":
        from = new Date(today)
        from.setDate(from.getDate() - from.getDay())
        break
      case "month":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "year":
        from = new Date(today.getFullYear(), 0, 1)
        break
    }

    setActivePreset(preset)
    setShowCustom(false)
    onDateRangeChange({ from, to })
  }

  const handleCustomRange = (type: "from" | "to", value: string) => {
    const date = new Date(value)
    const newRange = customRange || {
      from: new Date(),
      to: new Date(),
    }

    if (type === "from") {
      newRange.from = date
    } else {
      newRange.to = date
      newRange.to.setHours(23, 59, 59, 999)
    }

    setCustomRange(newRange)
    setActivePreset(null)
    onDateRangeChange(newRange)
  }

  return (
    <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md mb-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Filtrar por Fecha</h3>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => handlePreset("today")}
            className={`${
              activePreset === "today"
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Hoy
          </Button>
          <Button
            onClick={() => handlePreset("week")}
            className={`${
              activePreset === "week"
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Esta Semana
          </Button>
          <Button
            onClick={() => handlePreset("month")}
            className={`${
              activePreset === "month"
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Este Mes
          </Button>
          <Button
            onClick={() => handlePreset("year")}
            className={`${
              activePreset === "year"
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Este Año
          </Button>
          <Button
            onClick={() => {
              setShowCustom(!showCustom)
              setActivePreset(null)
            }}
            className={`${
              showCustom
                ? "bg-emerald-600 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            Personalizado
          </Button>
        </div>

        {/* Custom Range Inputs */}
        {showCustom && (
          <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Desde</label>
              <Input type="date" onChange={(e) => handleCustomRange("from", e.target.value)} className="w-full" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hasta</label>
              <Input type="date" onChange={(e) => handleCustomRange("to", e.target.value)} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
