const Presensi = require('../models/presensiModel');

exports.createPresensi = async (req, res) => {
  try {
    const { absensi_id, siswa_id } = req.body;
    const exists = await Presensi.checkExists(absensi_id, siswa_id);
    if (exists) return res.status(400).json({ message: 'Siswa sudah absen' });

    await Presensi.create(req.body);
    res.status(201).json({ message: 'Presensi berhasil' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
