'use strict';

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Generate sample RT/RW data
const generateRTs = (rwNumber, count) => {
  const rts = [];
  for (let i = 1; i <= count; i++) {
    rts.push({
      id: uuidv4(),
      rt_number: i,
      rw_number: rwNumber,
      created_at: new Date(),
      updated_at: new Date()
    });
  }
  return rts;
};

// Generate sample residents with RT/RW data
const generateResidents = (count) => {
  const residents = [];
  const firstNames = ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hani', 'Indra', 'Joko'];
  const lastNames = ['Santoso', 'Kusuma', 'Wijaya', 'Sari', 'Setiawan', 'Rahayu', 'Prabowo', 'Wibowo', 'Saputra', 'Lestari'];
  
  for (let rw = 1; rw <= 12; rw++) {
    // Generate 1-10 RTs per RW
    const rtCount = Math.floor(Math.random() * 10) + 1;
    
    for (let rt = 1; rt <= rtCount; rt++) {
      // Generate 5-15 residents per RT
      const residentCount = Math.floor(Math.random() * 11) + 5;
      
      for (let i = 0; i < residentCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const nik = `3${rw.toString().padStart(2, '0')}${rt.toString().padStart(2, '0')}${(i + 1).toString().padStart(4, '0')}`;
        
        residents.push({
          nik,
          nama: `${firstName} ${lastName}`,
          password: bcrypt.hashSync('warga123', 10),
          role: 'warga',
          rt: rt,
          rw: rw,
          alamat: `Jl. RW ${rw} RT ${rt} No. ${i + 1}`,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
  }
  
  return residents.slice(0, count); // Return requested number of residents
};

/**
 * Seeder untuk membuat akun Admin, RT, RW, dan Warga.
 * Jalankan dengan perintah:
 *   npx sequelize-cli db:seed:all
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    const now = new Date();
    const users = [
      // Admin
      {
        nik: '0000000000000000',
        nama: 'Administrator',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        alamat: 'Kantor Desa',
        created_at: now,
        updated_at: now
      },
      // Sample RW (Rukun Warga) - 12 RW
      ...Array.from({ length: 12 }, (_, i) => ({
        nik: `1${(i + 1).toString().padStart(2, '0')}000000000000`,
        nama: `Ketua RW ${i + 1}`,
        password: bcrypt.hashSync('rw123456', 10),
        role: 'rw',
        rw: i + 1,
        alamat: `Kantor RW ${i + 1}`,
        created_at: now,
        updated_at: now
      })),
      // Sample RT (Rukun Tetangga) - 10 RT per RW
      ...Array.from({ length: 12 }, (rw) => 
        Array.from({ length: 10 }, (_, rt) => ({
          nik: `2${(rw + 1).toString().padStart(2, '0')}${(rt + 1).toString().padStart(2, '0')}00000000`,
          nama: `Ketua RT ${rt + 1} RW ${rw + 1}`,
          password: bcrypt.hashSync('rt123456', 10),
          role: 'rt',
          rt: rt + 1,
          rw: rw + 1,
          alamat: `Kantor RT ${rt + 1} RW ${rw + 1}`,
          created_at: now,
          updated_at: now
        }))
      ).flat(),
      // Sample residents - 100 residents with RT/RW data
      ...generateResidents(100)
    ];

    await queryInterface.bulkInsert('users', users, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
