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
  const [customFrom, setCustomFrom] = useState<string>("")
  const [customTo, setCustomTo] = useState<string>("")
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const handlePreset = (preset: string) => {
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    let from = new Date(todayStart)
    const to = new Date(todayStart)

    switch (preset) {
      case "today":
        // from and to are already set to today
        break
      case "week":
        // Go back to start of week (Sunday)
        from.setDate(from.getDate() - from.getDay())
        break
      case "month":
        // Go to start of month
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        break
      case "year":
        // Go to start of year
        from = new Date(today.getFullYear(), 0, 1)
        break
    }

    setActivePreset(preset)
    setShowCustom(false)
    setCustomFrom("")
    setCustomTo("")
    onDateRangeChange({ from, to })
  }

  const handleCustomFrom = (value: string) => {
    setCustomFrom(value)
    setActivePreset(null)

    if (value && customTo) {
      // Parse as local date (YYYY-MM-DD format)
      const [year, month, day] = value.split("-").map(Number)
      const [toYear, toMonth, toDay] = customTo.split("-").map(Number)

      onDateRangeChange({
        from: new Date(year, month - 1, day),
        to: new Date(toYear, toMonth - 1, toDay),
      })
    }
  }

  const handleCustomTo = (value: string) => {
    setCustomTo(value)
    setActivePreset(null)

    if (customFrom && value) {
      // Parse as local date (YYYY-MM-DD format)
      const [fromYear, fromMonth, fromDay] = customFrom.split("-").map(Number)
      const [year, month, day] = value.split("-").map(Number)

      onDateRangeChange({
        from: new Date(fromYear, fromMonth - 1, fromDay),
        to: new Date(year, month - 1, day),
      })
    }
  }

  const handleClearFilter = () => {
    setActivePreset(null)
    setShowCustom(false)
    setCustomFrom("")
    setCustomTo("")
    onDateRangeChange(null)
  }

  return (
    <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md mb-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">Filtrar por Fecha</h3>
          {(activePreset || customFrom || customTo) && (
            <Button
              onClick={handleClearFilter}
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Limpiar filtro
            </Button>
          )}
        </div>

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
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => handleCustomFrom(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hasta</label>
              <Input type="date" value={customTo} onChange={(e) => handleCustomTo(e.target.value)} className="w-full" />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
