import { db } from "../core/config/knex.js";

/**
 * 🔹 Ambil semua siswa beserta data user-nya
 */
export const getAllSiswaWithUser = async () => {
  return db("master_siswa as s")
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
      "s.created_at",
      "s.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    );
};

/**
 * 🔹 Ambil siswa berdasarkan ID
 */
export const getSiswaByIdWithUser = async (id) => {
  return db("master_siswa as s")
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
      "s.created_at",
      "s.updated_at",
      "u.name as user_name",
      "u.role as user_role"
    )
    .where("s.SISWA_ID", id)
    .first();
};

/**
 * 🔹 Mapping data orang tua dari array ke kolom individual
 */
const mapOrangTuaData = (orangTuaArray) => {
  const result = {
    NAMA_AYAH: null,
    PEKERJAAN_AYAH: null,
    PENDIDIKAN_AYAH: null,
    ALAMAT_AYAH: null,
    NO_TELP_AYAH: null,
    NAMA_IBU: null,
    PEKERJAAN_IBU: null,
    PENDIDIKAN_IBU: null,
    ALAMAT_IBU: null,
    NO_TELP_IBU: null,
    NAMA_WALI: null,
    PEKERJAAN_WALI: null,
    PENDIDIKAN_WALI: null,
    ALAMAT_WALI: null,
    NO_TELP_WALI: null,
  };

  if (Array.isArray(orangTuaArray)) {
    orangTuaArray.forEach((ortu) => {
      switch (ortu.jenis) {
        case "Ayah":
          result.NAMA_AYAH = ortu.nama || null;
          result.PEKERJAAN_AYAH = ortu.pekerjaan || null;
          result.PENDIDIKAN_AYAH = ortu.pendidikan || null;
          result.ALAMAT_AYAH = ortu.alamat || null;
          result.NO_TELP_AYAH = ortu.no_hp || null;
          break;
        case "Ibu":
          result.NAMA_IBU = ortu.nama || null;
          result.PEKERJAAN_IBU = ortu.pekerjaan || null;
          result.PENDIDIKAN_IBU = ortu.pendidikan || null;
          result.ALAMAT_IBU = ortu.alamat || null;
          result.NO_TELP_IBU = ortu.no_hp || null;
          break;
        case "Wali":
          result.NAMA_WALI = ortu.nama || null;
          result.PEKERJAAN_WALI = ortu.pekerjaan || null;
          result.PENDIDIKAN_WALI = ortu.pendidikan || null;
          result.ALAMAT_WALI = ortu.alamat || null;
          result.NO_TELP_WALI = ortu.no_hp || null;
          break;
      }
    });
  }

  return result;
};


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
 * 🔹 Tambah siswa baru
 */
export const createSiswa = async (data) => {
  const {
    email,
    nis,
    nisn,
    nama,
    gender,
    tempat_lahir,
    tgl_lahir,
    agama,
    alamat,
    no_telp,
    status,
    gol_darah,
    tinggi,
    berat,
    kebutuhan_khusus,
    foto,
    orang_tua,
  } = data;

  // Parse orang_tua jika masih string
  let orangTuaArray = [];
  if (typeof orang_tua === "string") {
    try {
      orangTuaArray = JSON.parse(orang_tua);
    } catch (e) {
      console.error("Error parsing orang_tua:", e);
    }
  } else if (Array.isArray(orang_tua)) {
    orangTuaArray = orang_tua;
  }

  // Map data orang tua
  const orangTuaData = mapOrangTuaData(orangTuaArray);

  // Insert siswa
  const [siswaId] = await db("master_siswa").insert({
    EMAIL: email,
    NIS: nis,
    NISN: nisn,
    NAMA: nama,
    GENDER: gender,
    TEMPAT_LAHIR: tempat_lahir || null,
    TGL_LAHIR: tgl_lahir || null,
    AGAMA: agama || null,
    ALAMAT: alamat || null,
    NO_TELP: no_telp || null,
    STATUS: status || "Aktif",
    GOL_DARAH: gol_darah || null,
    TINGGI: tinggi || null,
    BERAT: berat || null,
    KEBUTUHAN_KHUSUS: kebutuhan_khusus || null,
    FOTO: foto || null,
    ...orangTuaData,
    created_at: new Date(),
  });

  return getSiswaByIdWithUser(siswaId);
};

/**
 * 🔹 Update siswa
 */
export const updateSiswa = async (id, data) => {
  // Ambil data siswa lama
  const existingSiswa = await db("master_siswa").where("SISWA_ID", id).first();

  if (!existingSiswa) {
    throw new Error("Siswa tidak ditemukan");
  }

  const {
    email,
    nis,
    nisn,
    nama,
    gender,
    tempat_lahir,
    tgl_lahir,
    agama,
    alamat,
    no_telp,
    status,
    gol_darah,
    tinggi,
    berat,
    kebutuhan_khusus,
    foto,
    orang_tua,
  } = data;

  // Parse orang_tua jika masih string
  let orangTuaArray = [];
  if (typeof orang_tua === "string") {
    try {
      orangTuaArray = JSON.parse(orang_tua);
    } catch (e) {
      console.error("Error parsing orang_tua:", e);
    }
  } else if (Array.isArray(orang_tua)) {
    orangTuaArray = orang_tua;
  }

  // Map data orang tua
  const orangTuaData = mapOrangTuaData(orangTuaArray);

  // Siapkan data untuk update
  const updateData = {
    EMAIL: email || existingSiswa.EMAIL,
    NIS: nis || existingSiswa.NIS,
    NISN: nisn || existingSiswa.NISN,
    NAMA: nama || existingSiswa.NAMA,
    GENDER: gender || existingSiswa.GENDER,
    TEMPAT_LAHIR: tempat_lahir !== undefined ? tempat_lahir : existingSiswa.TEMPAT_LAHIR,
    TGL_LAHIR: tgl_lahir !== undefined ? tgl_lahir : existingSiswa.TGL_LAHIR,
    AGAMA: agama !== undefined ? agama : existingSiswa.AGAMA,
    ALAMAT: alamat !== undefined ? alamat : existingSiswa.ALAMAT,
    NO_TELP: no_telp !== undefined ? no_telp : existingSiswa.NO_TELP,
    STATUS: status || existingSiswa.STATUS,
    GOL_DARAH: gol_darah !== undefined ? gol_darah : existingSiswa.GOL_DARAH,
    TINGGI: tinggi !== undefined ? tinggi : existingSiswa.TINGGI,
    BERAT: berat !== undefined ? berat : existingSiswa.BERAT,
    KEBUTUHAN_KHUSUS: kebutuhan_khusus !== undefined ? kebutuhan_khusus : existingSiswa.KEBUTUHAN_KHUSUS,
    FOTO: foto || existingSiswa.FOTO, // Keep old photo if no new one
    ...orangTuaData,
    updated_at: new Date(),
  };

  // Update siswa
  await db("master_siswa").where("SISWA_ID", id).update(updateData);

  // Update user jika email berubah
  if (email && email !== existingSiswa.EMAIL) {
    await db("users")
      .where("email", existingSiswa.EMAIL)
      .update({
        email: email,
        name: nama || existingSiswa.NAMA,
        updated_at: new Date(),
      });
  } else if (nama && existingSiswa.EMAIL) {
    // Update nama saja jika email tidak berubah
    await db("users")
      .where("email", existingSiswa.EMAIL)
      .update({
        name: nama,
        updated_at: new Date(),
      });
  }

  return getSiswaByIdWithUser(id);
};

/**
 * 🔹 Hapus siswa dan user terkait
 */
export const deleteSiswa = async (id) => {
  const siswa = await db("master_siswa").where("SISWA_ID", id).first();

  if (!siswa) {
    throw new Error("Siswa tidak ditemukan");
  }

  // Hapus siswa
  await db("master_siswa").where("SISWA_ID", id).del();

  // Hapus user terkait
  if (siswa.EMAIL) {
    await db("users").where("email", siswa.EMAIL).del();
  }

  return siswa;
};
