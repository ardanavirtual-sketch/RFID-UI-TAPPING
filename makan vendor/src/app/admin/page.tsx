'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Building,
  CreditCard,
  User,
  AlertCircle,
  CheckCircle,
  Home,
  Shield,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Karyawan {
  id: string
  card: string
  nik: string
  nama: string
  departemen: string
  pagi: string | null
  siang: string | null
  sore: string | null
  malam: string | null
  createdAt: string
  updatedAt: string
}

interface FormData {
  card: string
  nik: string
  nama: string
  departemen: string
}

export default function AdminPage() {
  const [karyawan, setKaryawan] = useState<Karyawan[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingKaryawan, setEditingKaryawan] = useState<Karyawan | null>(null)
  const [formData, setFormData] = useState<FormData>({
    card: '',
    nik: '',
    nama: '',
    departemen: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const router = useRouter()

  const departemenOptions = ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales', 'Logistics']

  // Simple authentication (dalam production, gunakan sistem yang lebih aman)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  }

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('admin_authenticated')
    if (auth === 'true') {
      setIsAuthenticated(true)
      fetchKaryawan()
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)

    try {
      // Simulasi delay untuk autentikasi
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (loginForm.username === ADMIN_CREDENTIALS.username && 
          loginForm.password === ADMIN_CREDENTIALS.password) {
        setIsAuthenticated(true)
        localStorage.setItem('admin_authenticated', 'true')
        fetchKaryawan()
      } else {
        setMessage({ type: 'error', text: 'Username atau password salah' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan saat login' })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('admin_authenticated')
    setLoginForm({ username: '', password: '' })
    setMessage(null)
  }

  const fetchKaryawan = async () => {
    try {
      const response = await fetch('/api/karyawan')
      const result = await response.json()
      
      if (result.success) {
        setKaryawan(result.data)
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengambil data karyawan' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      card: '',
      nik: '',
      nama: '',
      departemen: ''
    })
    setEditingKaryawan(null)
    setMessage(null)
  }

  const handleAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEdit = (k: Karyawan) => {
    setFormData({
      card: k.card,
      nik: k.nik,
      nama: k.nama,
      departemen: k.departemen
    })
    setEditingKaryawan(k)
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setMessage(null)

    try {
      const url = editingKaryawan ? `/api/karyawan/${editingKaryawan.id}` : '/api/karyawan'
      const method = editingKaryawan ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        await fetchKaryawan()
        setTimeout(() => {
          setIsDialogOpen(false)
          resetForm()
        }, 1000)
      } else {
        setMessage({ type: 'error', text: result.error || result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi' })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (k: Karyawan) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus ${k.nama}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/karyawan/${k.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: result.message })
        await fetchKaryawan()
      } else {
        setMessage({ type: 'error', text: result.message })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal menghapus karyawan' })
    }
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID')
  }

  const getShiftStatus = (k: Karyawan) => {
    const shifts = []
    if (k.pagi) shifts.push(<Badge key="pagi" variant="secondary" className="text-xs">Pagi</Badge>)
    if (k.siang) shifts.push(<Badge key="siang" variant="secondary" className="text-xs">Siang</Badge>)
    if (k.sore) shifts.push(<Badge key="sore" variant="secondary" className="text-xs">Sore</Badge>)
    if (k.malam) shifts.push(<Badge key="malam" variant="secondary" className="text-xs">Malam</Badge>)
    
    return shifts.length > 0 ? <div className="flex gap-1 flex-wrap">{shifts}</div> : <span className="text-gray-400 text-sm">Belum absen</span>
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Panel Admin</CardTitle>
            <CardDescription>
              Masuk untuk mengakses panel administrasi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>

              {message && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={loginLoading}>
                {loginLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Masuk...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1">
                <Home className="w-4 h-4" />
                Kembali ke Tap Kartu
              </Link>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 text-center">
                <strong>Default Login:</strong><br />
                Username: admin<br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Panel Admin</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Tap Kartu
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Message Alert */}
        {message && (
          <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{karyawan.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departemen</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {[...new Set(karyawan.map(k => k.departemen))].length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sudah Absen Hari Ini</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {karyawan.filter(k => 
                  k.pagi || k.siang || k.sore || k.malam
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Karyawan Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Data Karyawan</CardTitle>
                <CardDescription>Kelola data karyawan dan kartu RFID</CardDescription>
              </div>
              <Button onClick={handleAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Karyawan
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Memuat data...</p>
              </div>
            ) : karyawan.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Belum ada data karyawan</p>
                <Button onClick={handleAdd} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Karyawan Pertama
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Card ID</TableHead>
                      <TableHead>NIK</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Departemen</TableHead>
                      <TableHead>Status Absen</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {karyawan.map((k) => (
                      <TableRow key={k.id}>
                        <TableCell className="font-mono text-sm">{k.card}</TableCell>
                        <TableCell className="font-mono text-sm">{k.nik}</TableCell>
                        <TableCell className="font-medium">{k.nama}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{k.departemen}</Badge>
                        </TableCell>
                        <TableCell>{getShiftStatus(k)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(k)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(k)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingKaryawan ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingKaryawan ? 'Perbarui data karyawan yang ada' : 'Masukkan data karyawan baru'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="card">Card ID</Label>
                  <Input
                    id="card"
                    placeholder="Contoh: CARD001"
                    value={formData.card}
                    onChange={(e) => setFormData({ ...formData, card: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="nik">NIK</Label>
                  <Input
                    id="nik"
                    placeholder="Nomor Induk Karyawan"
                    value={formData.nik}
                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="nama">Nama Lengkap</Label>
                  <Input
                    id="nama"
                    placeholder="Nama lengkap karyawan"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="departemen">Departemen</Label>
                  <Select
                    value={formData.departemen}
                    onValueChange={(value) => setFormData({ ...formData, departemen: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih departemen" />
                    </SelectTrigger>
                    <SelectContent>
                      {departemenOptions.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {message && (
                <Alert className={`mb-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      {editingKaryawan ? 'Perbarui' : 'Simpan'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}