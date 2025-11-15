import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Ambil semua karyawan
export async function GET() {
  try {
    const karyawan = await db.karyawan.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: karyawan
    })
  } catch (error) {
    console.error('Error fetching karyawan:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal mengambil data karyawan',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// POST - Tambah karyawan baru
export async function POST(request: NextRequest) {
  try {
    const { card, nik, nama, departemen } = await request.json()

    if (!card || !nik || !nama || !departemen) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah card atau nik sudah ada
    const existingKaryawan = await db.karyawan.findFirst({
      where: {
        OR: [
          { card: card },
          { nik: nik }
        ]
      }
    })

    if (existingKaryawan) {
      return NextResponse.json(
        { 
          error: 'Card ID atau NIK sudah terdaftar',
          field: existingKaryawan.card === card ? 'card' : 'nik'
        },
        { status: 409 }
      )
    }

    const karyawan = await db.karyawan.create({
      data: {
        card,
        nik,
        nama,
        departemen
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Karyawan berhasil ditambahkan',
      data: karyawan
    })

  } catch (error) {
    console.error('Error creating karyawan:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal menambahkan karyawan',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}