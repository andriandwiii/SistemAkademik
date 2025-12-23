import * as StatusModel from "../models/statusPenilaianModel.js";

export const getCekStatus = async (req, res) => {
  try {
    const { kelas_id } = req.query;

    if (!kelas_id) {
      return res.status(400).json({ status: "01", message: "Pilih kelas!" });
    }

    const data = await StatusModel.getStatusLengkap(kelas_id);
    
    const formattedData = data.map(item => {
      const totalSiswa = item.TOTAL_SISWA || 0;
      return {
        ...item,
        TOTAL_SISWA: totalSiswa,
        STATUS_P: `${item.TERISI_P} / ${totalSiswa} Data`,
        STATUS_K: `${item.TERISI_K} / ${totalSiswa} Data`,
        // Flag untuk warna hijau di UI
        IS_COMPLETE: totalSiswa > 0 && item.TERISI_P >= totalSiswa
      };
    });

    res.json({ status: "00", data: formattedData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "99", message: err.message });
  }
};