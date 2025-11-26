"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const cleanPhone = phoneNumber.replace(/[\D]/g, "")
      if (cleanPhone.length < 10) {
        throw new Error("Por favor ingresa un número de teléfono válido (mínimo 10 dígitos)")
      }

      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: cleanPhone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al verificar el teléfono")
      }

      // Proceed to code entry
      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el teléfono")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const cleanPhone = phoneNumber.replace(/[\D]/g, "")

      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          code,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Código inválido. Intenta de nuevo.")
      }

      const data = await response.json()

      // Store session and redirect
      localStorage.setItem("authToken", data.token)
      localStorage.setItem("userId", data.userId)

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al verificar código")
    } finally {
      setLoading(false)
    }
  }

  if (step === "phone") {
    return (
      <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800">
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Número de Teléfono
            </label>
            <Input
              type="tel"
              placeholder="+51 926 770 008"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-lg h-12"
              required
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Incluye el código de país (ej: +51, +57)</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
            disabled={loading || !phoneNumber}
          >
            {loading ? "Verificando..." : "Continuar"}
          </Button>
        </form>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-0 shadow-lg bg-white dark:bg-slate-800">
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <button
          type="button"
          onClick={() => {
            setStep("phone")
            setError("")
            setCode("")
          }}
          className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 mb-2"
        >
          ← Cambiar teléfono
        </button>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Código de Verificación
          </label>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
            Ingresa el código que recibiste en {phoneNumber}
          </p>
          <Input
            type="text"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength="6"
            className="text-center text-2xl tracking-widest h-12 font-mono"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
          disabled={loading || code.length !== 6}
        >
          {loading ? "Verificando..." : "Iniciar Sesión"}
        </Button>
      </form>
    </Card>
  )
}
