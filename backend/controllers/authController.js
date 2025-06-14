const jwt = require('jsonwebtoken');
const { User } = require('../models');

const register = async (req, res) => {
  try {
    const { nik, nama, password, alamat, role = 'warga' } = req.body;
    
    // Validasi input
    if (!nik || !nama || !password) {
      return res.status(400).json({ message: 'NIK, nama, dan password harus diisi' });
    }

    // Cek apakah NIK sudah terdaftar
    const existingUser = await User.findOne({ where: { nik } });
    if (existingUser) {
      return res.status(400).json({ message: 'NIK sudah terdaftar' });
    }

    // Buat user baru
    const user = await User.create({
      nik,
      nama,
      password,
      alamat,
      role
    });

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Hilangkan password dari response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const login = async (req, res) => {
  try {
    const { nik, password } = req.body;

    // Validasi input
    if (!nik || !password) {
      return res.status(400).json({ message: 'NIK dan password harus diisi' });
    }

    // Cari user
    const user = await User.findOne({ where: { nik } });
    if (!user) {
      return res.status(401).json({ message: 'NIK atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'NIK atau password salah' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Hilangkan password dari response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      message: 'Login berhasil',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { 
          association: 'laporan',
          attributes: ['id', 'judul', 'status', 'created_at'],
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
};

module.exports = {
  register,
  login,
  getProfile
};
