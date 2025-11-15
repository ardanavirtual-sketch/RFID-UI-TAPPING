import { db } from '@/lib/db'

async function seedData() {
  try {
    // Sample karyawan data
    const sampleKaryawan = [
      {
        card: 'CARD001',
        nik: '1234567890123456',
        nama: 'Ahmad Wijaya',
        departemen: 'IT'
      },
      {
        card: 'CARD002',
        nik: '2345678901234567',
        nama: 'Siti Nurhaliza',
        departemen: 'HR'
      },
      {
        card: 'CARD003',
        nik: '3456789012345678',
        nama: 'Budi Santoso',
        departemen: 'Finance'
      },
      {
        card: 'CARD004',
        nik: '4567890123456789',
        nama: 'Dewi Lestari',
        departemen: 'Marketing'
      },
      {
        card: 'CARD005',
        nik: '5678901234567890',
        nama: 'Eko Prasetyo',
        departemen: 'Operations'
      }
    ]

    console.log('Menambahkan data karyawan sample...')

    for (const karyawan of sampleKaryawan) {
      await db.karyawan.create({
        data: karyawan
      })
      console.log(`✓ Karyawan ${karyawan.nama} berhasil ditambahkan`)
    }

    console.log('✅ Data sample berhasil ditambahkan!')
    
  } catch (error) {
    console.error('❌ Error seeding data:', error)
  } finally {
    await db.$disconnect()
  }
}

seedData()