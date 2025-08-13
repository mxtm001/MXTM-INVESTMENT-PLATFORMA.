"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Eye,
  EyeOff,
  MessageCircle,
} from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    } catch (error) {
      localStorage.removeItem("currentUser")
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleLogout = useCallback(() => {
    localStorage.removeItem("currentUser")
    router.push("/login")
  }, [router])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050e24] flex items-center justify-center">
        <div className="text-white">Loading dashboard...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#050e24] flex items-center justify-center">
        <div className="text-white">Redirecting to login...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050e24] p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user.name || "User"}!</h1>
            <p className="text-gray-400">Here's what's happening with your investments today.</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Verified</Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-[#253256] text-white hover:bg-[#162040] bg-transparent"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <Card className="bg-[#0a1735] border-[#253256] text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <button onClick={() => setShowBalance(!showBalance)} className="text-gray-400 hover:text-white">
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#f9a826]">
                {showBalance ? formatCurrency(user.balance || 5000) : "••••••"}
              </div>
              <p className="text-xs text-gray-400">Available for withdrawal</p>
            </CardContent>
          </Card>

          {/* Total Invested */}
          <Card className="bg-[#0a1735] border-[#253256] text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(2000)}</div>
              <p className="text-xs text-green-400">+12.5% from last month</p>
            </CardContent>
          </Card>

          {/* Total Profit */}
          <Card className="bg-[#0a1735] border-[#253256] text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-[#f9a826]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{formatCurrency(500)}</div>
              <p className="text-xs text-gray-400">Lifetime earnings</p>
            </CardContent>
          </Card>

          {/* Active Investments */}
          <Card className="bg-[#0a1735] border-[#253256] text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-gray-400">Currently running</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-[#0a1735] border-[#253256] text-white">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-[#253256] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ArrowDownRight className="h-4 w-4 text-green-400" />
                      <div>
                        <p className="text-sm font-medium">Initial deposit</p>
                        <p className="text-xs text-gray-400">Today</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">+{formatCurrency(1000)}</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">completed</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[#253256] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-sm font-medium">Premium Plan Investment</p>
                        <p className="text-xs text-gray-400">Yesterday</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">-{formatCurrency(500)}</p>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">completed</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#0a1735] border-[#253256] text-white">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account with these quick actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/dashboard/deposit">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <ArrowDownRight className="h-4 w-4 mr-2" />
                    Deposit Funds
                  </Button>
                </Link>
                <Link href="/dashboard/withdraw">
                  <Button className="w-full bg-[#f9a826] hover:bg-[#f9a826]/90 text-black">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Withdraw Funds
                  </Button>
                </Link>
                <Link href="/dashboard/investments">
                  <Button
                    variant="outline"
                    className="w-full border-[#253256] text-white hover:bg-[#162040] bg-transparent"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Investments
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button className="bg-[#f9a826] hover:bg-[#f9a826]/90 text-black rounded-full w-12 h-12 shadow-lg">
          <MessageCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
