"use client"

import { Card } from "@/components/ui/card"

interface Transaction {
  id: string
  amount: number
  category: string
  description: string
  type: "gasto" | "ingreso"
  date: string
}

interface TransactionListProps {
  transactions: Transaction[]
  loading: boolean
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

// Helper to format currency
function formatCurrency(amount: number): string {
  return `S/ ${amount.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function TransactionList({ transactions, loading }: TransactionListProps) {
  if (loading) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">Cargando transacciones...</div>
      </Card>
    )
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
        <div className="text-center py-8 text-slate-600 dark:text-slate-400">No hay transacciones en este período</div>
      </Card>
    )
  }

  const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card className="p-6 bg-white dark:bg-slate-800 border-0 shadow-md">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Transacciones</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Fecha</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Descripción</th>
              <th className="text-left py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Categoría</th>
              <th className="text-right py-3 px-4 font-medium text-slate-700 dark:text-slate-300">Monto</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((transaction) => {
              const amount = typeof transaction.amount === "string" ? parseFloat(transaction.amount) : transaction.amount
              const categoryKey = transaction.category?.toLowerCase() || "otros"
              const categoryLabel = CATEGORY_LABELS[categoryKey] || transaction.category
              
              return (
                <tr
                  key={transaction.id}
                  className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(transaction.date).toLocaleDateString("es-PE")}
                  </td>
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{transaction.description}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    <span className="inline-block px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs">
                      {categoryLabel}
                    </span>
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-semibold ${
                      transaction.type === "ingreso" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "ingreso" ? "+" : "-"}{formatCurrency(amount)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
