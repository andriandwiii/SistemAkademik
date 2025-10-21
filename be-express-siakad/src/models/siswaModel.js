import { db } from "../core/config/knex.js"; // Pastikan path knex.js benar

/**
 * 🔹 Ambil semua siswa beserta data user-nya
 */
export const getAllSiswaWithUser = async () => {
  const siswaList = await db("master_siswa as s")
    .leftJoin("users as u", "s.EMAIL", "u.email")
    .select(
      "s.SISWA_ID",
      "s.EMAIL",
      "s.NIS",
      "s.NISN",
      "s.NAMA",
      "s.GENDER",
      "s.TEMPAT_LAHIR",
      "s.TGL_LAHIR",
      "s.AGAMA",
      "s.ALAMAT",
      "s.NO_TELP",
      "s.STATUS",
      "s.GOL_DARAH",
      "s.TINGGI",
      "s.BERAT",
      "s.KEBUTUHAN_KHUSUS",
      "s.FOTO",
      "s.NAMA_AYAH",
      "s.PEKERJAAN_AYAH",
      "s.PENDIDIKAN_AYAH",
      "s.ALAMAT_AYAH",
      "s.NO_TELP_AYAH",
      "s.NAMA_IBU",
      "s.PEKERJAAN_IBU",
      "s.PENDIDIKAN_IBU",
      "s.ALAMAT_IBU",
      "s.NO_TELP_IBU",
      "s.NAMA_WALI",
      "s.PEKERJAAN_WALI",
      "s.PENDIDIKAN_WALI",
      "s.ALAMAT_WALI",
      "s.NO_TELP_WALI",
      "u.name as user_name",
      "u.role as user_role"
    );

  return siswaList;
};

/**
 * 🔹 Ambil siswa berdasarkan ID
 */
export const getSiswaByIdWithUser = async (id) => {
  const siswa = await db("master_siswa as s")
    .leftJoin("users as u", "s.EMAIL", "u.email")
    .select(
      "s.SISWA_ID",
      "s.EMAIL",
      "s.NIS",
      "s.NISN",
      "s.NAMA",
      "s.GENDER",
      "s.TEMPAT_LAHIR",
      "s.TGL_LAHIR",
      "s.AGAMA",
      "s.ALAMAT",
      "s.NO_TELP",
      "s.STATUS",
      "s.GOL_DARAH",
      "s.TINGGI",
      "s.BERAT",
      "s.KEBUTUHAN_KHUSUS",
      "s.FOTO",
      "s.NAMA_AYAH",
      "s.PEKERJAAN_AYAH",
      "s.PENDIDIKAN_AYAH",
      "s.ALAMAT_AYAH",
      "s.NO_TELP_AYAH",
      "s.NAMA_IBU",
      "s.PEKERJAAN_IBU",
      "s.PENDIDIKAN_IBU",
      "s.ALAMAT_IBU",
      "s.NO_TELP_IBU",
      "s.NAMA_WALI",
      "s.PEKERJAAN_WALI",
      "s.PENDIDIKAN_WALI",
      "s.ALAMAT_WALI",
      "s.NO_TELP_WALI",
      "u.name as user_name",
      "u.role as user_role"
    )
    .where("s.SISWA_ID", id)
    .first();

  return siswa || null;
};

/**
 * 🔹 Tambah siswa baru (mapping array orang_tua langsung ke kolom)
 */
export const addSiswa = async (data, trx = null) => {
  const query = trx ? trx("master_siswa") : db("master_siswa");

  // Mapping array orang_tua ke kolom
  let namaAyah = null, pekerjaanAyah = null, pendidikanAyah = null, alamatAyah = null, noTelpAyah = null;
  let namaIbu = null, pekerjaanIbu = null, pendidikanIbu = null, alamatIbu = null, noTelpIbu = null;
  let namaWali = null, pekerjaanWali = null, pendidikanWali = null, alamatWali = null, noTelpWali = null;

  if (Array.isArray(data.orang_tua)) {
    data.orang_tua.forEach((ortu) => {
      switch (ortu.jenis) {
        case "Ayah":
          namaAyah = ortu.nama;
          pekerjaanAyah = ortu.pekerjaan || null;
          pendidikanAyah = ortu.pendidikan || null;
          alamatAyah = ortu.alamat || null;
          noTelpAyah = ortu.no_hp || null;
          break;
        case "Ibu":
          namaIbu = ortu.nama;
          pekerjaanIbu = ortu.pekerjaan || null;
          pendidikanIbu = ortu.pendidikan || null;
          alamatIbu = ortu.alamat || null;
          noTelpIbu = ortu.no_hp || null;
          break;
        case "Wali":
          namaWali = ortu.nama;
          pekerjaanWali = ortu.pekerjaan || null;
          pendidikanWali = ortu.pendidikan || null;
          alamatWali = ortu.alamat || null;
          noTelpWali = ortu.no_hp || null;
          break;
      }
    });
  }

  const [id] = await query.insert({
    EMAIL: data.EMAIL,
    NIS: data.NIS,
    NISN: data.NISN,
    NAMA: data.NAMA,
    GENDER: data.GENDER,
    TEMPAT_LAHIR: data.TEMPAT_LAHIR,
    TGL_LAHIR: data.TGL_LAHIR,
    AGAMA: data.AGAMA,
    ALAMAT: data.ALAMAT,
    NO_TELP: data.NO_TELP,
    STATUS: data.STATUS || "Aktif",
    GOL_DARAH: data.GOL_DARAH,
    TINGGI: data.TINGGI,
    BERAT: data.BERAT,
    KEBUTUHAN_KHUSUS: data.KEBUTUHAN_KHUSUS,
    FOTO: data.FOTO,
    NAMA_AYAH: namaAyah,
    PEKERJAAN_AYAH: pekerjaanAyah,
    PENDIDIKAN_AYAH: pendidikanAyah,
    ALAMAT_AYAH: alamatAyah,
    NO_TELP_AYAH: noTelpAyah,
    NAMA_IBU: namaIbu,
    PEKERJAAN_IBU: pekerjaanIbu,
    PENDIDIKAN_IBU: pendidikanIbu,
    ALAMAT_IBU: alamatIbu,
    NO_TELP_IBU: noTelpIbu,
    NAMA_WALI: namaWali,
    PEKERJAAN_WALI: pekerjaanWali,
    PENDIDIKAN_WALI: pendidikanWali,
    ALAMAT_WALI: alamatWali,
    NO_TELP_WALI: noTelpWali,
  });

  return getSiswaByIdWithUser(id);
};

/**
 * 🔹 Update data siswa
 */
export const updateSiswa = async (id, data) => {
  return addSiswa({ ...data, EMAIL: data.EMAIL }, db.transaction()); // Bisa reuse logika mapping
};

/**
 * 🔹 Hapus siswa dan user terkait
 */
export const deleteSiswa = async (id) => {
  const siswa = await db("master_siswa").where("SISWA_ID", id).first();
  if (!siswa) return null;

  await db("master_siswa").where("SISWA_ID", id).del();
  await db("users").where("email", siswa.EMAIL).del();

  return siswa;
};
