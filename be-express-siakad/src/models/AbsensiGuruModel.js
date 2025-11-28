import { db } from "../core/config/knex.js"; // Sesuaikan path ini

/* --- 1. LIST GURU (DROPDOWN) --- */
export const getListGuru = async () => {
  return db("master_guru")
    .select("NIP", "NAMA")
    .where("STATUS_KEPEGAWAIAN", "Aktif")
    .orderBy("NAMA", "asc");
};

/* --- 2. AMBIL DATA BY ID (UTK DELETE) --- */
export const getAbsensiById = async (id) => {
  return db("absensi_guru").where("ID", id).first();
};

/* --- 3. CEK STATUS ABSENSI HARI INI --- */
export const getAbsensiByNipDate = async (nip, tanggal) => {
  return db("absensi_guru")
    .where({
      NIP: nip,
      TANGGAL: tanggal
    })
    .first();
};

/* --- 4. GET ALL DATA (REKAP ADMIN) --- */
export const getAllAbsensiWithGuru = async ({ startDate, endDate } = {}) => {
  const query = db("absensi_guru as ag")
    .join("master_guru as mg", "ag.NIP", "mg.NIP")
    .leftJoin("master_jabatan as mj", "mg.KODE_JABATAN", "mj.KODE_JABATAN")
    .select(
      "ag.*", 
      "mg.NAMA as NAMA_GURU",
      "mg.FOTO as FOTO_PROFILE_GURU",
      "mj.NAMA_JABATAN"
    );

  if (startDate && endDate) {
    query.whereBetween("ag.TANGGAL", [startDate, endDate]);
  }

  return query.orderBy("ag.TANGGAL", "desc").orderBy("ag.JAM_MASUK", "asc");
};

/* --- 5. GET RIWAYAT (PER GURU) --- */
export const getRiwayatAbsensiByNip = async (nip, limit = 30) => {
  return db("absensi_guru")
    .where("NIP", nip)
    .orderBy("TANGGAL", "desc")
    .limit(limit);
};

/* ===========================================================
 * 6. CREATE / INSERT ABSEN MASUK (PERBAIKAN UTAMA DISINI)
 * =========================================================== */
export const createAbsenMasuk = async (data) => {
  
  // 1. Generate Kode Custom (AG + 5 Angka Random)
  // Contoh: AG12345
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const customKode = `AG${randomNum}`;

  // 2. Insert Data
  // Catatan: Kolom 'ID' tidak perlu diisi, karena Auto Increment
  const [newId] = await db("absensi_guru").insert({
    KODE: customKode, // Pakai kode custom
    ...data
  });
  
  // 3. Return data yang baru saja dibuat berdasarkan ID baru
  return db("absensi_guru")
    .where("ID", newId)
    .first();
};

/* --- 7. UPDATE ABSEN PULANG --- */
export const updateAbsenPulang = async (nip, tanggal, data) => {
  await db("absensi_guru")
    .where({ NIP: nip, TANGGAL: tanggal })
    .update({
      ...data,
      updated_at: db.fn.now()
    });

  return getAbsensiByNipDate(nip, tanggal);
};

/* --- 8. DELETE ABSENSI --- */
export const deleteAbsensi = async (id) => {
  return db("absensi_guru").where("ID", id).del();
};