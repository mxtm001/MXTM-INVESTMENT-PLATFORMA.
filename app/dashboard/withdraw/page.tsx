"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Home,
  Wallet,
  History,
  LifeBuoy,
  LogOut,
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  FileCheck,
  Bitcoin,
  DollarSign,
  X,
  Star,
  Shield,
  Zap,
  Crown,
  Sparkles,
  TrendingUp,
  Award,
  Gift,
  Banknote,
  Coins,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react"
import { userService } from "@/lib/user-service"

const cryptocurrencies = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    network: "Rede Bitcoin",
    minWithdrawal: 0.001,
    fee: 0.0005,
    icon: "₿",
    color: "from-orange-400 to-yellow-500",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    network: "Rede Ethereum",
    minWithdrawal: 0.01,
    fee: 0.005,
    icon: "Ξ",
    color: "from-blue-400 to-purple-500",
  },
  {
    name: "Tether",
    symbol: "USDT",
    network: "ERC-20 / TRC-20",
    minWithdrawal: 10,
    fee: 1,
    icon: "₮",
    color: "from-green-400 to-emerald-500",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    network: "ERC-20",
    minWithdrawal: 10,
    fee: 1,
    icon: "$",
    color: "from-blue-400 to-cyan-500",
  },
  {
    name: "Binance Coin",
    symbol: "BNB",
    network: "Rede BSC",
    minWithdrawal: 0.01,
    fee: 0.001,
    icon: "B",
    color: "from-yellow-400 to-orange-500",
  },
  {
    name: "Cardano",
    symbol: "ADA",
    network: "Rede Cardano",
    minWithdrawal: 10,
    fee: 1,
    icon: "₳",
    color: "from-blue-500 to-indigo-600",
  },
  {
    name: "Solana",
    symbol: "SOL",
    network: "Rede Solana",
    minWithdrawal: 0.1,
    fee: 0.01,
    icon: "◎",
    color: "from-purple-400 to-pink-500",
  },
  {
    name: "Polygon",
    symbol: "MATIC",
    network: "Rede Polygon",
    minWithdrawal: 1,
    fee: 0.1,
    icon: "⬟",
    color: "from-purple-500 to-violet-600",
  },
]

export default function WithdrawPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("")
  const [selectedCrypto, setSelectedCrypto] = useState("")
  const [accountDetails, setAccountDetails] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [swiftCode, setSwiftCode] = useState("")
  const [paypalEmail, setPaypalEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [processing, setProcessing] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showFancyErrorModal, setShowFancyErrorModal] = useState(false)
  const [transactionId, setTransactionId] = useState("")
  const [brazilianBankCode, setBrazilianBankCode] = useState("")
  const [brazilianAgency, setBrazilianAgency] = useState("")
  const [brazilianAccount, setBrazilianAccount] = useState("")
  const [brazilianAccountType, setBrazilianAccountType] = useState("")
  const [brazilianCpf, setBrazilianCpf] = useState("")
  const [pixKey, setPixKey] = useState("")
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await userService.getCurrentUser()
      if (!currentUser) {
        router.push("/login")
        return
      }
      setUser(currentUser)
      setLoading(false)
    }

    loadUser()

    // Listen for balance updates
    const handleBalanceUpdate = (event: any) => {
      if (event.detail && event.detail.balance) {
        setUser((prevUser: any) => ({
          ...prevUser,
          balance: event.detail.balance,
        }))
        setSuccess("Processamento de saque falhou. Fundos foram devolvidos à sua conta.")
        setTimeout(() => setSuccess(""), 5000)
      }
    }

    window.addEventListener("balanceUpdated", handleBalanceUpdate)
    return () => window.removeEventListener("balanceUpdated", handleBalanceUpdate)
  }, [router])

  const handleLogout = async () => {
    await userService.logout()
    router.push("/login")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount)
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "bank_transfer":
        return <Building2 className="h-5 w-5" />
      case "cryptocurrency":
        return <Bitcoin className="h-5 w-5" />
      case "paypal":
        return <CreditCard className="h-5 w-5" />
      case "mobile_money":
        return <Smartphone className="h-5 w-5" />
      default:
        return <Wallet className="h-5 w-5" />
    }
  }

  const getSelectedCryptoDetails = () => {
    return cryptocurrencies.find((crypto) => crypto.symbol === selectedCrypto)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setProcessing(true)

    if (!amount || !method) {
      setError("Por favor, preencha todos os campos obrigatórios")
      setProcessing(false)
      return
    }

    const withdrawalAmount = Number.parseFloat(amount)
    if (withdrawalAmount <= 0) {
      setError("Por favor, insira um valor válido")
      setProcessing(false)
      return
    }

    if (withdrawalAmount > user.balance) {
      setError("Saldo insuficiente")
      setProcessing(false)
      return
    }

    // Validate method-specific fields
    if (method === "cryptocurrency") {
      if (!selectedCrypto) {
        setError("Por favor, selecione uma criptomoeda")
        setProcessing(false)
        return
      }
      if (!walletAddress) {
        setError("Por favor, insira o endereço da carteira")
        setProcessing(false)
        return
      }

      const cryptoDetails = getSelectedCryptoDetails()
      if (cryptoDetails && withdrawalAmount < cryptoDetails.minWithdrawal * 100) {
        setError(`Valor mínimo de saque é R$${(cryptoDetails.minWithdrawal * 100).toFixed(2)}`)
        setProcessing(false)
        return
      }
    }

    let details = ""
    switch (method) {
      case "bank_transfer":
        if (!bankName || !accountNumber) {
          setError("Por favor, preencha todos os dados bancários")
          setProcessing(false)
          return
        }
        details = `Banco: ${bankName}, Conta: ${accountNumber}, Roteamento: ${routingNumber}, SWIFT: ${swiftCode}`
        break
      case "cryptocurrency":
        const cryptoDetails = getSelectedCryptoDetails()
        details = `${cryptoDetails?.name} (${selectedCrypto}) - Carteira: ${walletAddress}`
        break
      case "paypal":
        if (!paypalEmail) {
          setError("Por favor, insira o email do PayPal")
          setProcessing(false)
          return
        }
        details = `PayPal: ${paypalEmail}`
        break
      case "mobile_money":
        if (!phoneNumber) {
          setError("Por favor, insira o número de telefone")
          setProcessing(false)
          return
        }
        details = `Dinheiro Móvel: ${phoneNumber}`
        break
      case "brazilian_bank":
        if (!brazilianBankCode || !brazilianAgency || !brazilianAccount || !brazilianAccountType || !brazilianCpf) {
          setError("Por favor, preencha todos os dados bancários brasileiros")
          setProcessing(false)
          return
        }
        details = `Banco Brasileiro: ${brazilianBankCode}, Agência: ${brazilianAgency}, Conta: ${brazilianAccount} (${brazilianAccountType}), CPF/CNPJ: ${brazilianCpf}${pixKey ? `, PIX: ${pixKey}` : ""}`
        break
      default:
        details = accountDetails
    }

    try {
      const result = await userService.withdraw(withdrawalAmount, method, details)

      if (result.success) {
        setTransactionId(result.transactionId || "")
        setShowSuccessModal(true)

        // Update user balance immediately
        const updatedUser = await userService.getCurrentUser()
        if (updatedUser) {
          setUser(updatedUser)
        }

        // Reset form
        setAmount("")
        setMethod("")
        setSelectedCrypto("")
        setAccountDetails("")
        setWalletAddress("")
        setBankName("")
        setAccountNumber("")
        setRoutingNumber("")
        setSwiftCode("")
        setPaypalEmail("")
        setPhoneNumber("")
        setBrazilianBankCode("")
        setBrazilianAgency("")
        setBrazilianAccount("")
        setBrazilianAccountType("")
        setBrazilianCpf("")
        setPixKey("")
      } else {
        setShowFancyErrorModal(true)
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
      setShowFancyErrorModal(true)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050e24] via-[#0a1735] to-[#162040] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f9a826] mx-auto mb-4"></div>
          <div className="text-white text-lg">Carregando página de saque...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050e24] via-[#0a1735] to-[#162040] flex">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-40 w-40 h-40 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-full blur-xl animate-pulse delay-3000"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0a1735] to-[#162040] text-white hidden md:block border-r border-[#253256]/50 backdrop-blur-sm">
        <div className="p-4 border-b border-[#253256]/50">
          <Link href="/" className="flex items-center group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#f9a826]/20 group-hover:ring-[#f9a826]/40 transition-all">
              <Image src="/logo.png" alt="MXTM Investment" fill className="object-cover" />
            </div>
            <span className="ml-2 font-bold bg-gradient-to-r from-[#f9a826] to-yellow-400 bg-clip-text text-transparent">
              MXTM INVESTMENT
            </span>
          </Link>
        </div>

        <div className="p-4">
          <div className="flex items-center mb-8 p-3 bg-gradient-to-r from-[#162040] to-[#253256] rounded-lg">
            <div className="bg-gradient-to-r from-[#f9a826] to-yellow-400 h-10 w-10 rounded-full flex items-center justify-center mr-3">
              <span className="text-black font-bold">{user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}</span>
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name || "Usuário"}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>

          <nav>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#162040] hover:to-[#253256] text-gray-300 hover:text-white transition-all group"
                >
                  <Home className="mr-3 h-5 w-5 group-hover:text-[#f9a826] transition-colors" />
                  Painel
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/deposit"
                  className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#162040] hover:to-[#253256] text-gray-300 hover:text-white transition-all group"
                >
                  <Wallet className="mr-3 h-5 w-5 group-hover:text-[#f9a826] transition-colors" />
                  Depósito
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/withdraw"
                  className="flex items-center p-3 rounded-lg bg-gradient-to-r from-[#f9a826] to-yellow-400 text-black font-medium"
                >
                  <Banknote className="mr-3 h-5 w-5" />
                  Saque
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/investments"
                  className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#162040] hover:to-[#253256] text-gray-300 hover:text-white transition-all group"
                >
                  <TrendingUp className="mr-3 h-5 w-5 group-hover:text-[#f9a826] transition-colors" />
                  Investimentos
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/history"
                  className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#162040] hover:to-[#253256] text-gray-300 hover:text-white transition-all group"
                >
                  <History className="mr-3 h-5 w-5 group-hover:text-[#f9a826] transition-colors" />
                  Histórico
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/verification"
                  className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#162040] hover:to-[#253256] text-gray-300 hover:text-white transition-all group"
                >
                  <FileCheck className="mr-3 h-5 w-5 group-hover:text-[#f9a826] transition-colors" />
                  Verificação
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/support"
                  className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#162040] hover:to-[#253256] text-gray-300 hover:text-white transition-all group"
                >
                  <LifeBuoy className="mr-3 h-5 w-5 group-hover:text-[#f9a826] transition-colors" />
                  Suporte
                </Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center p-3 rounded-lg hover:bg-gradient-to-r hover:from-red-500/20 hover:to-red-600/20 text-gray-300 hover:text-red-400 w-full text-left transition-all group"
                >
                  <LogOut className="mr-3 h-5 w-5 group-hover:text-red-400 transition-colors" />
                  Sair
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-[#0a1735] to-[#162040] z-10 border-b border-[#253256]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image src="/logo.png" alt="MXTM Investment" fill className="object-cover" />
            </div>
            <span className="ml-2 font-bold text-[#f9a826] text-sm">MXTM</span>
          </Link>
          <div className="flex items-center">
            <Link href="/dashboard" className="mr-4">
              <Home className="h-5 w-5 text-white" />
            </Link>
            <button onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 pt-20 md:pt-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href="/dashboard" className="mr-4 text-gray-400 hover:text-[#f9a826] transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                💰 Sacar Fundos
              </h1>
              <p className="text-gray-400 mt-1">Retire seus fundos de forma rápida e segura</p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6 border-red-500/50 bg-red-500/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 bg-green-500/10 border-green-500/50 text-green-400">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Withdrawal Form */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-[#0a1735] to-[#162040] border-[#253256]/50 text-white shadow-2xl">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl flex items-center">
                        <Sparkles className="h-6 w-6 text-[#f9a826] mr-2" />
                        Solicitação de Saque
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-2">
                        Preencha os detalhes do seu saque. Processamento em até 5 minutos.
                      </CardDescription>
                    </div>
                    <div className="hidden md:block">
                      <div className="bg-gradient-to-r from-[#f9a826] to-yellow-400 p-3 rounded-full">
                        <Coins className="h-6 w-6 text-black" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="amount" className="text-white font-medium">
                          💵 Valor (BRL)
                        </Label>
                        <div className="relative">
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Digite o valor"
                            className="bg-[#162040]/80 border-[#253256] text-white pl-12 h-12 text-lg font-medium backdrop-blur-sm"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="1"
                            max={user?.balance || 0}
                            step="0.01"
                          />
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#f9a826]" />
                        </div>
                        <p className="text-xs text-gray-400 flex items-center">
                          <Wallet className="h-3 w-3 mr-1" />
                          Disponível: {formatCurrency(user?.balance || 0)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="method" className="text-white font-medium">
                          🏦 Método de Saque
                        </Label>
                        <Select value={method} onValueChange={setMethod}>
                          <SelectTrigger
                            id="method"
                            className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                          >
                            <SelectValue placeholder="Selecione o método" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a1735] border-[#253256] text-white">
                            <SelectItem value="bank_transfer">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-blue-400" />
                                Transferência Bancária
                              </div>
                            </SelectItem>
                            <SelectItem value="cryptocurrency">
                              <div className="flex items-center">
                                <Bitcoin className="h-4 w-4 mr-2 text-orange-400" />
                                Criptomoeda
                              </div>
                            </SelectItem>
                            <SelectItem value="paypal">
                              <div className="flex items-center">
                                <CreditCard className="h-4 w-4 mr-2 text-blue-500" />
                                PayPal
                              </div>
                            </SelectItem>
                            <SelectItem value="mobile_money">
                              <div className="flex items-center">
                                <Smartphone className="h-4 w-4 mr-2 text-green-400" />
                                Dinheiro Móvel
                              </div>
                            </SelectItem>
                            <SelectItem value="brazilian_bank">
                              <div className="flex items-center">
                                <Building2 className="h-4 w-4 mr-2 text-yellow-400" />
                                Banco Brasileiro (PIX/TED)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Cryptocurrency Selection */}
                    {method === "cryptocurrency" && (
                      <div className="space-y-6 p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
                        <div className="flex items-center mb-4">
                          <Bitcoin className="h-6 w-6 text-orange-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Saque em Criptomoeda</h3>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="crypto" className="text-white font-medium">
                            🪙 Selecionar Criptomoeda
                          </Label>
                          <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                            <SelectTrigger
                              id="crypto"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                            >
                              <SelectValue placeholder="Escolha a criptomoeda" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0a1735] border-[#253256] text-white">
                              {cryptocurrencies.map((crypto) => (
                                <SelectItem key={crypto.symbol} value={crypto.symbol}>
                                  <div className="flex items-center">
                                    <div
                                      className={`w-6 h-6 rounded-full bg-gradient-to-r ${crypto.color} flex items-center justify-center mr-3`}
                                    >
                                      <span className="text-white text-xs font-bold">{crypto.icon}</span>
                                    </div>
                                    {crypto.name} ({crypto.symbol})
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedCrypto && (
                          <div className="bg-[#162040]/60 p-4 rounded-lg border border-[#253256]/50 backdrop-blur-sm">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center">
                                <Shield className="h-4 w-4 text-blue-400 mr-2" />
                                <div>
                                  <p className="text-gray-400">Rede</p>
                                  <p className="text-white font-medium">{getSelectedCryptoDetails()?.network}</p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Coins className="h-4 w-4 text-yellow-400 mr-2" />
                                <div>
                                  <p className="text-gray-400">Taxa da Rede</p>
                                  <p className="text-white font-medium">
                                    {getSelectedCryptoDetails()?.fee} {selectedCrypto}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <ArrowRight className="h-4 w-4 text-green-400 mr-2" />
                                <div>
                                  <p className="text-gray-400">Saque Mínimo</p>
                                  <p className="text-white font-medium">
                                    R${((getSelectedCryptoDetails()?.minWithdrawal || 0) * 100).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-purple-400 mr-2" />
                                <div>
                                  <p className="text-gray-400">Tempo de Processamento</p>
                                  <p className="text-white font-medium">5-30 minutos</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="wallet" className="text-white font-medium">
                            🔐 Endereço da Carteira
                          </Label>
                          <Textarea
                            id="wallet"
                            placeholder={`Digite o endereço da sua carteira ${selectedCrypto || "de criptomoeda"}`}
                            className="bg-[#162040]/80 border-[#253256] text-white min-h-[80px] backdrop-blur-sm"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                          />
                          <div className="flex items-center text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            ⚠️ Certifique-se de que o endereço da carteira está correto. Endereços incorretos podem
                            resultar em perda permanente de fundos.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer Details */}
                    {method === "bank_transfer" && (
                      <div className="space-y-4 p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-center mb-4">
                          <Building2 className="h-6 w-6 text-blue-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Transferência Bancária</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bank-name" className="text-white font-medium">
                              🏛️ Nome do Banco
                            </Label>
                            <Input
                              id="bank-name"
                              placeholder="Digite o nome do banco"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="account-number" className="text-white font-medium">
                              🔢 Número da Conta
                            </Label>
                            <Input
                              id="account-number"
                              placeholder="Digite o número da conta"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={accountNumber}
                              onChange={(e) => setAccountNumber(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="routing-number" className="text-white font-medium">
                              📍 Número de Roteamento (Opcional)
                            </Label>
                            <Input
                              id="routing-number"
                              placeholder="Digite o número de roteamento"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={routingNumber}
                              onChange={(e) => setRoutingNumber(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="swift-code" className="text-white font-medium">
                              🌐 Código SWIFT (Opcional)
                            </Label>
                            <Input
                              id="swift-code"
                              placeholder="Digite o código SWIFT"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={swiftCode}
                              onChange={(e) => setSwiftCode(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Brazilian Bank Details */}
                    {method === "brazilian_bank" && (
                      <div className="space-y-4 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-full mr-3">
                              <span className="text-white text-lg">🇧🇷</span>
                            </div>
                            <h3 className="text-lg font-semibold text-white">Banco Brasileiro</h3>
                          </div>
                          <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                            <span className="text-blue-400 text-sm font-medium">PIX • TED</span>
                          </div>
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-md mb-4">
                          <p className="text-blue-400 text-sm flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Complete seus dados bancários brasileiros para transferência PIX ou TED
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bank-code" className="text-white font-medium">
                              🏦 Código do Banco
                            </Label>
                            <Select value={brazilianBankCode} onValueChange={setBrazilianBankCode}>
                              <SelectTrigger className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm">
                                <SelectValue placeholder="Selecione o banco" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0a1735] border-[#253256] text-white">
                                <SelectItem value="001">001 - Banco do Brasil</SelectItem>
                                <SelectItem value="104">104 - Caixa Econômica Federal</SelectItem>
                                <SelectItem value="237">237 - Bradesco</SelectItem>
                                <SelectItem value="341">341 - Itaú</SelectItem>
                                <SelectItem value="033">033 - Santander</SelectItem>
                                <SelectItem value="260">260 - Nu Pagamentos (Nubank)</SelectItem>
                                <SelectItem value="323">323 - Mercado Pago</SelectItem>
                                <SelectItem value="290">290 - PagSeguro</SelectItem>
                                <SelectItem value="077">077 - Banco Inter</SelectItem>
                                <SelectItem value="212">212 - Banco Original</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="agency" className="text-white font-medium">
                              🏢 Agência
                            </Label>
                            <Input
                              id="agency"
                              placeholder="Digite o número da agência"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={brazilianAgency}
                              onChange={(e) => setBrazilianAgency(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="account" className="text-white font-medium">
                              💳 Número da Conta
                            </Label>
                            <Input
                              id="account"
                              placeholder="Digite o número da conta"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={brazilianAccount}
                              onChange={(e) => setBrazilianAccount(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="account-type" className="text-white font-medium">
                              📋 Tipo de Conta
                            </Label>
                            <Select value={brazilianAccountType} onValueChange={setBrazilianAccountType}>
                              <SelectTrigger className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm">
                                <SelectValue placeholder="Selecione o tipo de conta" />
                              </SelectTrigger>
                              <SelectContent className="bg-[#0a1735] border-[#253256] text-white">
                                <SelectItem value="corrente">Conta Corrente</SelectItem>
                                <SelectItem value="poupanca">Conta Poupança</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="cpf" className="text-white font-medium">
                              🆔 CPF/CNPJ
                            </Label>
                            <Input
                              id="cpf"
                              placeholder="Digite o CPF ou CNPJ"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={brazilianCpf}
                              onChange={(e) => setBrazilianCpf(e.target.value)}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="pix-key" className="text-white font-medium">
                              ⚡ Chave PIX (Opcional)
                            </Label>
                            <Input
                              id="pix-key"
                              placeholder="Digite a chave PIX (CPF, email, telefone ou chave aleatória)"
                              className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                              value={pixKey}
                              onChange={(e) => setPixKey(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 flex items-center">
                              <Zap className="h-3 w-3 mr-1 text-yellow-400" />
                              Se fornecida, o saque será processado via PIX (mais rápido). Caso contrário, será usado
                              TED.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PayPal Details */}
                    {method === "paypal" && (
                      <div className="space-y-4 p-6 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20">
                        <div className="flex items-center mb-4">
                          <CreditCard className="h-6 w-6 text-blue-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">PayPal</h3>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="paypal-email" className="text-white font-medium">
                            📧 Email do PayPal
                          </Label>
                          <Input
                            id="paypal-email"
                            type="email"
                            placeholder="Digite o endereço de email do PayPal"
                            className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Mobile Money Details */}
                    {method === "mobile_money" && (
                      <div className="space-y-4 p-6 bg-gradient-to-r from-green-500/10 to-teal-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center mb-4">
                          <Smartphone className="h-6 w-6 text-green-400 mr-2" />
                          <h3 className="text-lg font-semibold text-white">Dinheiro Móvel</h3>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone-number" className="text-white font-medium">
                            📱 Número de Telefone
                          </Label>
                          <Input
                            id="phone-number"
                            placeholder="Digite o número de telefone do dinheiro móvel"
                            className="bg-[#162040]/80 border-[#253256] text-white h-12 backdrop-blur-sm"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Warning Alert */}
                    <Alert className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Aviso Importante
                      </AlertTitle>
                      <AlertDescription>
                        Você precisa manter um saldo mínimo de <strong className="text-yellow-400">700 BRL</strong> para
                        processar saques. Se seu saldo estiver abaixo deste valor, você precisará fazer um depósito
                        antes de sacar.
                      </AlertDescription>
                    </Alert>

                    <div className="pt-6">
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-[#f9a826] to-yellow-400 hover:from-[#f9a826]/90 hover:to-yellow-400/90 text-black font-bold h-14 text-lg shadow-lg transform hover:scale-[1.02] transition-all duration-200"
                        disabled={processing}
                      >
                        {processing ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-3"></div>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Processando Saque...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            {getMethodIcon(method)}
                            <span className="ml-2">✨ Solicitar Saque</span>
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* Balance Card */}
              <Card className="bg-gradient-to-br from-[#0a1735] to-[#162040] border-[#253256]/50 text-white shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Wallet className="h-5 w-5 text-[#f9a826] mr-2" />
                      Saldo Disponível
                    </CardTitle>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-[#f9a826] to-yellow-400 bg-clip-text text-transparent mb-2">
                      {showBalance ? formatCurrency(user?.balance || 0) : "••••••"}
                    </div>
                    <p className="text-sm text-gray-400 mb-4">Pronto para saque</p>
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 p-4 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <Shield className="h-5 w-5 text-yellow-400 mr-2" />
                        <span className="text-yellow-400 font-semibold">Mínimo Necessário</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">700 BRL</p>
                      <p className="text-xs text-gray-400 mt-1">Você deve manter este saldo para processar saques</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cryptocurrency Info */}
              {method === "cryptocurrency" && (
                <Card className="bg-gradient-to-br from-[#0a1735] to-[#162040] border-[#253256]/50 text-white shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Bitcoin className="h-5 w-5 text-orange-400 mr-2" />
                      Criptomoedas Suportadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {cryptocurrencies.map((crypto) => (
                        <div
                          key={crypto.symbol}
                          className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                            selectedCrypto === crypto.symbol
                              ? "bg-gradient-to-r from-[#f9a826]/20 to-yellow-400/20 border border-[#f9a826]/30"
                              : "bg-[#162040]/50 hover:bg-[#162040]/80"
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full bg-gradient-to-r ${crypto.color} flex items-center justify-center mr-3`}
                            >
                              <span className="text-white text-sm font-bold">{crypto.icon}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{crypto.symbol}</p>
                              <p className="text-xs text-gray-400">{crypto.network}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400">Taxa: {crypto.fee}</p>
                            <p className="text-xs text-green-400">Min: R${(crypto.minWithdrawal * 100).toFixed(0)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Processing Info */}
              <Card className="bg-gradient-to-br from-[#0a1735] to-[#162040] border-[#253256]/50 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award className="h-5 w-5 text-purple-400 mr-2" />
                    Informações de Processamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
                      <Clock className="h-5 w-5 text-blue-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-400">Tempo de Processamento</p>
                        <p className="text-xs text-gray-400">Saques são processados em até 5 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                      <DollarSign className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-400">Saldo Mínimo</p>
                        <p className="text-xs text-gray-400">700 BRL necessários para processar saques</p>
                      </div>
                    </div>
                    <div className="flex items-start p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                      <Shield className="h-5 w-5 text-purple-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-purple-400">Segurança</p>
                        <p className="text-xs text-gray-400">
                          Todos os saques são protegidos com criptografia avançada
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VIP Benefits */}
              <Card className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 text-white shadow-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Crown className="h-5 w-5 text-yellow-400 mr-2" />
                    Benefícios VIP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Zap className="h-4 w-4 text-yellow-400 mr-2" />
                      <span>Processamento prioritário</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Gift className="h-4 w-4 text-pink-400 mr-2" />
                      <span>Taxas reduzidas</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 text-blue-400 mr-2" />
                      <span>Suporte 24/7</span>
                    </div>
                    <Button className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      <Crown className="h-4 w-4 mr-2" />
                      Upgrade para VIP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Fancy Full-Screen Error Modal */}
      {showFancyErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-sm">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fillRule=evenodd%3E%3Cg fill=%23ffffff fillOpacity=0.05%3E%3Ccircle cx=30 cy=30 r=2/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          </div>

          {/* Modal Content */}
          <div className="relative z-10 max-w-2xl mx-4 p-8 bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowFancyErrorModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Header with Crown */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-6 animate-pulse">
                <Crown className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                SERVIÇOS PREMIUM
              </h2>
              <div className="flex items-center justify-center space-x-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>

            {/* Main Message */}
            <div className="text-center space-y-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border border-blue-500/30">
                <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold text-white mb-3">🚫 SAQUE TEMPORARIAMENTE INDISPONÍVEL</h3>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Para desbloquear nossos <span className="text-yellow-400 font-bold">serviços premium de saque</span>,
                  é necessário aprimorar sua conta com um depósito mínimo de{" "}
                  <span className="text-green-400 font-bold text-xl">R$ 700,00</span>.
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
                <Zap className="h-12 w-12 text-green-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-300 text-lg leading-relaxed">
                  🔐 Esta medida de segurança garante o processamento otimizado das transações e protege seus{" "}
                  <span className="text-blue-400 font-bold">ativos valiosos</span>.
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Bitcoin className="h-8 w-8 text-orange-400 animate-spin" style={{ animationDuration: "3s" }} />
                  <Building2 className="h-8 w-8 text-blue-400 animate-pulse" />
                  <CreditCard className="h-8 w-8 text-green-400 animate-bounce" />
                </div>
                <p className="text-gray-300 text-lg leading-relaxed">
                  💰 Após a conclusão, você terá acesso instantâneo a todos os métodos de saque, incluindo{" "}
                  <span className="text-yellow-400 font-bold">PIX, TED e transferências internacionais</span>.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl p-4 border border-indigo-500/30 mb-6">
                <p className="text-gray-300 text-lg">
                  🎯 Obrigado por escolher nossa{" "}
                  <span className="text-purple-400 font-bold">plataforma financeira exclusiva</span>!
                </p>
              </div>

              <Button
                onClick={() => setShowFancyErrorModal(false)}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                ✨ ENTENDI - FAZER DEPÓSITO ✨
              </Button>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-pulse opacity-75"></div>
          <div className="absolute bottom-32 left-40 w-5 h-5 bg-purple-400 rounded-full animate-bounce opacity-75"></div>
          <div className="absolute bottom-20 right-20 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
        </div>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-gradient-to-br from-[#0a1735] to-[#162040] border-[#253256]/50 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-2 rounded-full mr-3">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              Saque Enviado com Sucesso
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-lg">
              Sua solicitação de saque foi enviada e está sendo processada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#162040] to-[#253256] p-6 rounded-xl border border-[#253256]/50">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div className="flex items-center">
                  <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                    <FileCheck className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400">ID da Transação</p>
                    <p className="font-mono text-white font-medium">{transactionId}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-green-500/20 p-2 rounded-lg mr-3">
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400">Valor</p>
                    <p className="text-white font-medium">{formatCurrency(Number.parseFloat(amount) || 0)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-purple-500/20 p-2 rounded-lg mr-3">
                    <CreditCard className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400">Método</p>
                    <p className="capitalize text-white font-medium">{method?.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-500/20 p-2 rounded-lg mr-3">
                    <Clock className="h-4 w-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-gray-400">Status</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400 font-medium">
                      <Clock className="h-3 w-3 mr-1" />
                      Processando
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 p-4 rounded-xl">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-blue-400 mr-3" />
                <p className="text-blue-400 text-sm">
                  💡 Seu saque está sendo processado. Você pode acompanhar o status no seu histórico de transações.
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-gradient-to-r from-[#f9a826] to-yellow-400 hover:from-[#f9a826]/90 hover:to-yellow-400/90 text-black font-bold h-12 text-lg"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Continuar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
