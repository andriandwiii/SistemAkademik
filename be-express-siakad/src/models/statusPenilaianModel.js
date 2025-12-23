import { db } from "../core/config/knex.js";

export const getStatusLengkap = async (kelasId) => {
  const infoKelas = await db("transaksi_siswa_kelas")
    .where("KELAS_ID", kelasId)
    .select("JURUSAN_ID")
    .first();

  const jurusanRef = infoKelas?.JURUSAN_ID === 'J0001' ? 1 : 2;

  return db("master_mata_pelajaran as mmp")
    .select(
      "mmp.KODE_MAPEL",
      "mmp.NAMA_MAPEL",
      db.raw("? as Rombel", [kelasId]),
      db.raw(`(
        SELECT COUNT(DISTINCT tsk.NIS) 
        FROM transaksi_siswa_kelas tsk 
        WHERE tsk.KELAS_ID = ?
      ) as TOTAL_SISWA`, [kelasId]),
      db.raw("COUNT(DISTINCT tn_p.ID) as TERISI_P"),
      db.raw("COUNT(DISTINCT tn_k.ID) as TERISI_K")
    )
    .leftJoin("transaksi_nilai as tn_p", function() {
      this.on("tn_p.KODE_MAPEL", "=", "mmp.KODE_MAPEL")
          .andOn("tn_p.KELAS_ID", "=", db.raw("?", [kelasId]))
          .andOn(db.raw("tn_p.NILAI_P IS NOT NULL"));
    })
    .leftJoin("transaksi_nilai as tn_k", function() {
      this.on("tn_k.KODE_MAPEL", "=", "mmp.KODE_MAPEL")
          .andOn("tn_k.KELAS_ID", "=", db.raw("?", [kelasId]))
          .andOn(db.raw("tn_k.NILAI_K IS NOT NULL"));
    })
    .where("mmp.STATUS", "Aktif")
    .andWhereNot("mmp.KATEGORI", "Non-Akademik")
    .andWhere(function() {
      this.whereIn('mmp.ID', function() {
        this.select('MAPEL_KOMPONEN_ID')
            .from('transaksi_gabung_mapel')
            .where('JURUSAN_ID_REF', jurusanRef);
      })
      .orWhere('mmp.KATEGORI', 'Wajib A')
      .orWhere('mmp.KATEGORI', 'Wajib B')
      .orWhere('mmp.KATEGORI', 'Muatan Lokal');
      // .orWhere('mmp.KATEGORI', 'Lintas Minat') <--- INI DIHAPUS
    })
    .groupBy("mmp.KODE_MAPEL", "mmp.NAMA_MAPEL", "mmp.ID")
    .orderBy("mmp.ID", "asc");
};