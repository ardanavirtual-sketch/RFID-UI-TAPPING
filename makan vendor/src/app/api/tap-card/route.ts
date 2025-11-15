import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { cardId } = await request.json()

    if (!cardId) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      )
    }

    // Cari karyawan berdasarkan card ID
    const karyawan = await db.karyawan.findUnique({
      where: { card: cardId }
    })

    if (!karyawan) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Kartu tidak terdaftar',
          data: null
        },
        { status: 404 }
      )
    }

    // Tentukan shift berdasarkan waktu
    const now = new Date()
    const hour = now.getHours()
    let shift = null

    if (hour >= 6 && hour < 14) {
      shift = 'pagi'
    } else if (hour >= 14 && hour < 18) {
      shift = 'siang'
    } else if (hour >= 18 && hour < 22) {
      shift = 'sore'
    } else {
      shift = 'malam'
    }

    // Update waktu absen sesuai shift
    const updateData: any = {
      updatedAt: now
    }

    updateData[shift] = now

    const updatedKaryawan = await db.karyawan.update({
      where: { id: karyawan.id },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message: `Absen ${shift} berhasil untuk ${karyawan.nama}`,
      data: {
        id: updatedKaryawan.id,
        card: updatedKaryawan.card,
        nik: updatedKaryawan.nik,
        nama: updatedKaryawan.nama,
        departemen: updatedKaryawan.departemen,
        shift: shift,
        waktu: now
      }
    })

  } catch (error) {
    console.error('Error tapping card:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Terjadi kesalahan server',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}