import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Ambil karyawan berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const karyawan = await db.karyawan.findUnique({
      where: { id: params.id }
    })

    if (!karyawan) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      )
    }

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

// PUT - Update karyawan
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { card, nik, nama, departemen } = await request.json()

    if (!card || !nik || !nama || !departemen) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Cek apakah karyawan ada
    const existingKaryawan = await db.karyawan.findUnique({
      where: { id: params.id }
    })

    if (!existingKaryawan) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek duplikasi card atau nik (kecuali untuk karyawan ini)
    const duplicateKaryawan = await db.karyawan.findFirst({
      where: {
        AND: [
          { id: { not: params.id } },
          {
            OR: [
              { card: card },
              { nik: nik }
            ]
          }
        ]
      }
    })

    if (duplicateKaryawan) {
      return NextResponse.json(
        { 
          error: 'Card ID atau NIK sudah digunakan',
          field: duplicateKaryawan.card === card ? 'card' : 'nik'
        },
        { status: 409 }
      )
    }

    const karyawan = await db.karyawan.update({
      where: { id: params.id },
      data: {
        card,
        nik,
        nama,
        departemen
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Data karyawan berhasil diperbarui',
      data: karyawan
    })

  } catch (error) {
    console.error('Error updating karyawan:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal memperbarui data karyawan',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Hapus karyawan
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Cek apakah karyawan ada
    const existingKaryawan = await db.karyawan.findUnique({
      where: { id: params.id }
    })

    if (!existingKaryawan) {
      return NextResponse.json(
        { error: 'Karyawan tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.karyawan.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Karyawan berhasil dihapus'
    })

  } catch (error) {
    console.error('Error deleting karyawan:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Gagal menghapus karyawan',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}