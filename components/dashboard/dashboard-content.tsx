"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TransactionList } from "./transaction-list"
import { ExpenseCharts } from "./expense-charts"
import { DateFilters } from "./date-filters"

interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  type: "gasto" | "ingreso"
  date: string
  currency?: string
}

interface UserInfo {
  id: number
  name: string | null
  email: string | null
  whatsapp_number: string
}

// Helper to format currency (PEN = Soles)
function formatCurrency(amount: number, currency: string = "PEN"): string {
  if (currency === "PEN") {
    return `S/ ${amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$${amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Helper to format phone number for display
function formatPhone(phone: string): string {
  if (!phone) return ""
  // Add +51 prefix if not present and format
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 9) {
    return `+51 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  }
  if (digits.length >= 11 && digits.startsWith("51")) {
    const local = digits.slice(2)
    return `+51 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
  }
  return phone
}

export function DashboardContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId")
    if (!storedUserId) {
      window.location.href = "/auth/login"
      return
    }
    setUserId(storedUserId)
  }, [])

  // Fetch user info
  useEffect(() => {
    if (!userId) return

    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`/api/user?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setUserInfo(data)
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    fetchUserInfo()
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const fetchTransactions = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/transactions?userId=${userId}`)
        if (!response.ok) throw new Error("Error fetching transactions")

        const data = await response.json()
        // Convert amount from string to number (PostgreSQL NUMERIC comes as string)
        const normalized = data.map((t: any) => ({
          ...t,
          amount: typeof t.amount === "string" ? parseFloat(t.amount) : t.amount,
          category: t.category?.toLowerCase() || "otros",
        }))
        setTransactions(normalized)
        setFilteredTransactions(normalized)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [userId])

  useEffect(() => {
    if (!dateRange) {
      setFilteredTransactions(transactions)
      return
    }

    const filtered = transactions.filter((t) => {
      const txDate = new Date(t.date)
      return txDate >= dateRange.from && txDate <= dateRange.to
    })
    setFilteredTransactions(filtered)
  }, [dateRange, transactions])

  if (!userId) {
    return <div className="text-center py-8">Redirigiendo...</div>
  }

  const totalGastos = filteredTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)

  const totalIngresos = filteredTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)

  const neto = totalIngresos - totalGastos

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-950 dark:to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mi Presupuesto</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Reporte de gastos e ingresos</p>
          </div>
          <Button
            onClick={() => {
              localStorage.removeItem("authToken")
              localStorage.removeItem("userId")
              window.location.href = "/auth/login"
            }}
            className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white"
          >
            Salir
          </Button>
        </div>

        {/* User Welcome Card */}
        {userInfo && (
          <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : "U"}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  ¡Bienvenido, {userInfo.name || "Usuario"}!
                </h2>
                <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {userInfo.email && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {userInfo.email}
                    </span>
                  )}
                  {userInfo.whatsapp_number && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {formatPhone(userInfo.whatsapp_number)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Total Ingresos</p>
            <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalIngresos)}</p>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Total Gastos</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(totalGastos)}</p>
          </Card>

          <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Neto</p>
            <p className={`text-3xl font-bold ${neto >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(neto)}
            </p>
          </Card>
        </div>

        {/* Date Filters */}
        <DateFilters onDateRangeChange={setDateRange} />

        {/* Charts */}
        <ExpenseCharts transactions={filteredTransactions} />

        {/* Transaction List */}
        <TransactionList transactions={filteredTransactions} loading={loading} />
      </div>
    </div>
  )
}
