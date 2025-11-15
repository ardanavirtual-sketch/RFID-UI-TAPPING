'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Building,
  LogIn
} from 'lucide-react'

interface TapResult {
  success: boolean
  message: string
  data?: {
    id: string
    card: string
    nik: string
    nama: string
    departemen: string
    shift: string
    waktu: string
  }
}

export default function Home() {
  const [cardId, setCardId] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastResult, setLastResult] = useState<TapResult | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isSimulating, setIsSimulating] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getCurrentShift = () => {
    const hour = currentTime.getHours()
    if (hour >= 6 && hour < 14) return { name: 'Pagi', color: 'bg-yellow-500' }
    if (hour >= 14 && hour < 18) return { name: 'Siang', color: 'bg-blue-500' }
    if (hour >= 18 && hour < 22) return { name: 'Sore', color: 'bg-orange-500' }
    return { name: 'Malam', color: 'bg-purple-500' }
  }

  const handleTapCard = async () => {
    if (!cardId.trim()) {
      setLastResult({
        success: false,
        message: 'Silakan masukkan Card ID terlebih dahulu'
      })
      return
    }

    setLoading(true)
    setLastResult(null)

    try {
      const response = await fetch('/api/tap-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId: cardId.trim() }),
      })

      const result = await response.json()
      setLastResult(result)

      if (result.success) {
        setCardId('')
      }
    } catch (error) {
      setLastResult({
        success: false,
        message: 'Terjadi kesalahan koneksi'
      })
    } finally {
      setLoading(false)
    }
  }

  const simulateRFIDScan = () => {
    setIsSimulating(true)
    // Simulasi beberapa card ID yang sudah terdaftar
    const sampleCards = ['CARD001', 'CARD002', 'CARD003', 'CARD004', 'CARD005']
    const randomCard = sampleCards[Math.floor(Math.random() * sampleCards.length)]
    
    setCardId(randomCard)
    
    setTimeout(() => {
      handleTapCard()
      setIsSimulating(false)
    }, 1000)
  }

  const shift = getCurrentShift()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sistem Absensi RFID
          </h1>
          <p className="text-gray-600">
            Tap kartu RFID untuk melakukan absensi
          </p>
        </div>

        {/* Current Time and Shift */}
        <div className="text-center mb-8">
          <div className="text-3xl font-mono font-bold text-gray-900 mb-2">
            {currentTime.toLocaleTimeString('id-ID')}
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge className={`${shift.color} text-white`}>
              Shift {shift.name}
            </Badge>
            <span className="text-gray-600">
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Tap Card Interface */}
        <Card className="w-full mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Tap Kartu RFID
            </CardTitle>
            <CardDescription>
              Masukkan ID kartu atau gunakan simulasi untuk testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Masukkan Card ID (contoh: CARD001)"
                value={cardId}
                onChange={(e) => setCardId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTapCard()}
                disabled={loading}
                className="flex-1"
                autoFocus
              />
              <Button 
                onClick={handleTapCard} 
                disabled={loading || !cardId.trim()}
                className="min-w-[100px]"
              >
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Memproses
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Tap
                  </>
                )}
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={simulateRFIDScan}
              disabled={isSimulating}
              className="w-full"
            >
              {isSimulating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Mensimulasikan...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Simulasi Tap Kartu
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Display */}
        {lastResult && (
          <Card className={`w-full ${lastResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                {lastResult.success ? (
                  <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 mt-1" />
                )}
                <div className="flex-1">
                  <Alert className={`mb-3 ${lastResult.success ? 'border-green-200 bg-green-100' : 'border-red-200 bg-red-100'}`}>
                    <AlertDescription>
                      {lastResult.message}
                    </AlertDescription>
                  </Alert>
                  
                  {lastResult.success && lastResult.data && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Nama:</span>
                        <span>{lastResult.data.nama}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">NIK:</span>
                        <span>{lastResult.data.nik}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Departemen:</span>
                        <span>{lastResult.data.departemen}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">Shift:</span>
                        <Badge variant="secondary">{lastResult.data.shift}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hidden Admin Access */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Admin Access: <kbd className="px-2 py-1 bg-gray-200 rounded">/admin</kbd>
          </p>
        </div>
      </div>
    </div>
  )
}