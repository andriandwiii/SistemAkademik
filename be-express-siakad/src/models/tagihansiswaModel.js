import { db } from "../core/config/knex.js";

const table = "tagihan_siswa";

/**
 * Get all tagihan with filters
 */
export const getAllTagihan = async (filters = {}) => {
  let query = db(`${table} as t`)
    .leftJoin("master_siswa as s", "t.NIS", "s.NIS")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .leftJoin("master_tahun_ajaran as ta", "t.TAHUN_AJARAN_ID", "ta.TAHUN_AJARAN_ID")
    .select(
      "t.*",
      "s.NAMA as NAMA_SISWA",
      "s.NO_TELP",
      "k.NAMA_KOMPONEN",
      "k.JENIS_BIAYA",
      "ta.NAMA_TAHUN_AJARAN"
    );

  if (filters.nis) query.where("t.NIS", filters.nis);
  if (filters.status) query.where("t.STATUS", filters.status);
  if (filters.tahunAjaranId) query.where("t.TAHUN_AJARAN_ID", filters.tahunAjaranId);
  if (filters.bulan) query.where("t.BULAN", filters.bulan);
  if (filters.tagihanId) query.where("t.TAGIHAN_ID", filters.tagihanId);

  return query.orderBy("t.TGL_JATUH_TEMPO", "asc");
};

/**
 * Get tagihan by NIS
 */
export const getTagihanByNIS = async (nis, tahunAjaranId) => {
  return db(`${table} as t`)
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "t.*",
      "k.NAMA_KOMPONEN",
      "k.JENIS_BIAYA",
      "k.WAJIB"
    )
    .where("t.NIS", nis)
    .where("t.TAHUN_AJARAN_ID", tahunAjaranId)
    .orderBy([
      { column: "k.URUTAN", order: "asc" },
      { column: "t.BULAN", order: "asc" }
    ]);
};

/**
 * Get tagihan by ID
 */
export const getTagihanById = async (tagihanId) => {
  return db(`${table} as t`)
    .leftJoin("master_siswa as s", "t.NIS", "s.NIS")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "t.*",
      "s.NAMA as NAMA_SISWA",
      "k.NAMA_KOMPONEN"
    )
    .where("t.TAGIHAN_ID", tagihanId)
    .first();
};

/**
 * Create tagihan
 */
export const createTagihan = async (data) => {
  return db.transaction(async (trx) => {
    // Generate TAGIHAN_ID dan NOMOR_TAGIHAN
    const lastTagihan = await trx(table)
      .select("TAGIHAN_ID")
      .orderBy("id", "desc")
      .first()
      .forUpdate();

    let nextNumber = 1;
    if (lastTagihan && lastTagihan.TAGIHAN_ID) {
      const numericPart = parseInt(lastTagihan.TAGIHAN_ID.replace("TAG", ""), 10);
      if (!isNaN(numericPart)) nextNumber = numericPart + 1;
    }
    const tagihanId = `TAG${nextNumber.toString().padStart(10, "0")}`;
    const nomorTagihan = `INV${nextNumber.toString().padStart(10, "0")}`;

    const [id] = await trx(table).insert({
      ...data,
      TAGIHAN_ID: tagihanId,
      NOMOR_TAGIHAN: nomorTagihan,
      TOTAL: data.NOMINAL - (data.POTONGAN || 0)
    });

    return trx(table).where("id", id).first();
  });
};

/**
 * Update tagihan
 */
export const updateTagihan = async (tagihanId, data) => {
  // Recalculate total if nominal or potongan changed
  if (data.NOMINAL !== undefined || data.POTONGAN !== undefined) {
    const current = await db(table).where("TAGIHAN_ID", tagihanId).first();
    const nominal = data.NOMINAL !== undefined ? data.NOMINAL : current.NOMINAL;
    const potongan = data.POTONGAN !== undefined ? data.POTONGAN : current.POTONGAN;
    data.TOTAL = nominal - potongan;
  }

  await db(table).where("TAGIHAN_ID", tagihanId).update(data);
  return db(table).where("TAGIHAN_ID", tagihanId).first();
};

/**
 * Delete tagihan
 */
export const deleteTagihan = async (tagihanId) => {
  const tagihan = await db(table).where("TAGIHAN_ID", tagihanId).first();
  if (!tagihan) return null;
  
  await db(table).where("TAGIHAN_ID", tagihanId).del();
  return tagihan;
};

/**
 * Generate SPP massal untuk semua siswa
 * FINAL VERSION - Dengan KATEGORI_ID dari transaksi_siswa_kelas
 */
export const generateSPPMassal = async (tahunAjaranId, bulan, tahun, komponenIdSPP = "KOMP001") => {
  return db.transaction(async (trx) => {
    console.log(`🔍 Mencari siswa aktif untuk tahun ajaran: ${tahunAjaranId}`);
    
    // 1. Ambil semua siswa aktif dari transaksi_siswa_kelas dengan KATEGORI_ID
    const siswaList = await trx("transaksi_siswa_kelas as tsk")
      .join("master_siswa as s", "tsk.NIS", "s.NIS")
      .select(
        "s.NIS",
        "s.NAMA",
        "tsk.TINGKATAN_ID",
        "tsk.JURUSAN_ID",
        "tsk.KELAS_ID",
        "tsk.KATEGORI_ID"
      )
      .where("tsk.TAHUN_AJARAN_ID", tahunAjaranId)
      .where("s.STATUS", "Aktif");

    console.log(`📊 Ditemukan ${siswaList.length} siswa aktif`);

    if (siswaList.length === 0) {
      console.log("⚠️ Tidak ada siswa aktif yang terdaftar di tahun ajaran ini");
      return [];
    }

    const results = [];

    for (const siswa of siswaList) {
      console.log(`\n🔄 Processing siswa: ${siswa.NIS} - ${siswa.NAMA}`);
      console.log(`   Kategori: ${siswa.KATEGORI_ID || 'NULL'}, Tingkat: ${siswa.TINGKATAN_ID || 'NULL'}`);

      // 2. Cek apakah tagihan sudah ada
      const existing = await trx(table)
        .where({
          NIS: siswa.NIS,
          KOMPONEN_ID: komponenIdSPP,
          TAHUN_AJARAN_ID: tahunAjaranId,
          BULAN: bulan,
          TAHUN: tahun
        })
        .first();

      if (existing) {
        console.log(`   ⚠️  Tagihan sudah ada: ${existing.TAGIHAN_ID}`);
        results.push({ 
          nis: siswa.NIS, 
          nama: siswa.NAMA, 
          status: "sudah_ada",
          tagihan_id: existing.TAGIHAN_ID
        });
        continue;
      }

      // 3. Ambil tarif SPP berdasarkan kategori dan tingkatan
      // Coba dulu dengan tingkatan spesifik
      let tarif = null;
      
      if (siswa.TINGKATAN_ID && siswa.KATEGORI_ID) {
        tarif = await trx("master_tarif_biaya")
          .where({
            KOMPONEN_ID: komponenIdSPP,
            KATEGORI_ID: siswa.KATEGORI_ID,
            TAHUN_AJARAN_ID: tahunAjaranId,
            TINGKATAN_ID: siswa.TINGKATAN_ID,
            STATUS: "Aktif"
          })
          .first();
      }

      // Jika tidak ada, coba tarif untuk semua tingkatan (TINGKATAN_ID = NULL)
      if (!tarif && siswa.KATEGORI_ID) {
        console.log(`   🔍 Tarif spesifik tidak ada, mencoba tarif umum...`);
        tarif = await trx("master_tarif_biaya")
          .where({
            KOMPONEN_ID: komponenIdSPP,
            KATEGORI_ID: siswa.KATEGORI_ID,
            TAHUN_AJARAN_ID: tahunAjaranId,
            STATUS: "Aktif"
          })
          .whereNull("TINGKATAN_ID")
          .first();
      }

      if (!tarif) {
        console.log(`   ❌ Tarif tidak ditemukan`);
        results.push({ 
          nis: siswa.NIS, 
          nama: siswa.NAMA, 
          status: "tarif_tidak_ada",
          detail: `Kategori: ${siswa.KATEGORI_ID || 'NULL'}, Tingkat: ${siswa.TINGKATAN_ID || 'NULL'}`
        });
        continue;
      }

      console.log(`   ✅ Tarif ditemukan: ${tarif.TARIF_ID}, Nominal: ${tarif.NOMINAL}`);

      // 4. Generate ID
      const lastTagihan = await trx(table)
        .select("TAGIHAN_ID")
        .orderBy("id", "desc")
        .first()
        .forUpdate();

      let nextNumber = 1;
      if (lastTagihan && lastTagihan.TAGIHAN_ID) {
        const numericPart = parseInt(lastTagihan.TAGIHAN_ID.replace("TAG", ""), 10);
        if (!isNaN(numericPart)) nextNumber = numericPart + 1;
      }
      const tagihanId = `TAG${nextNumber.toString().padStart(10, "0")}`;
      const nomorTagihan = `INV${nextNumber.toString().padStart(10, "0")}`;

      // 5. Insert tagihan
      const tglJatuhTempo = new Date(tahun, bulan - 1, 10);

      await trx(table).insert({
        TAGIHAN_ID: tagihanId,
        NOMOR_TAGIHAN: nomorTagihan,
        NIS: siswa.NIS,
        KOMPONEN_ID: komponenIdSPP,
        TAHUN_AJARAN_ID: tahunAjaranId,
        BULAN: bulan,
        TAHUN: tahun,
        NOMINAL: tarif.NOMINAL,
        POTONGAN: 0,
        TOTAL: tarif.NOMINAL,
        STATUS: "BELUM_BAYAR",
        TGL_JATUH_TEMPO: tglJatuhTempo
      });

      console.log(`   ✅ Tagihan berhasil dibuat: ${tagihanId}`);

      results.push({ 
        nis: siswa.NIS, 
        nama: siswa.NAMA, 
        status: "berhasil",
        tagihan_id: tagihanId,
        nominal: tarif.NOMINAL
      });
    }

    console.log(`\n📋 Summary Generate SPP:`);
    console.log(`   Total Processed: ${results.length}`);
    console.log(`   Berhasil: ${results.filter(r => r.status === "berhasil").length}`);
    console.log(`   Sudah Ada: ${results.filter(r => r.status === "sudah_ada").length}`);
    console.log(`   Gagal (Tarif Tidak Ada): ${results.filter(r => r.status === "tarif_tidak_ada").length}`);

    return results;
  });
};

/**
 * Get summary tagihan by NIS
 */
export const getTagihanSummary = async (nis, tahunAjaranId) => {
  const result = await db(table)
    .where("NIS", nis)
    .where("TAHUN_AJARAN_ID", tahunAjaranId)
    .select(
      db.raw("COUNT(*) as total_tagihan"),
      db.raw("SUM(TOTAL) as total_nominal"),
      db.raw("SUM(CASE WHEN STATUS = 'LUNAS' THEN 1 ELSE 0 END) as sudah_bayar"),
      db.raw("SUM(CASE WHEN STATUS = 'BELUM_BAYAR' THEN 1 ELSE 0 END) as belum_bayar"),
      db.raw("SUM(CASE WHEN STATUS = 'SEBAGIAN' THEN 1 ELSE 0 END) as sebagian"),
      db.raw("SUM(CASE WHEN STATUS = 'LUNAS' THEN TOTAL ELSE 0 END) as total_terbayar"),
      db.raw("SUM(CASE WHEN STATUS != 'LUNAS' THEN TOTAL ELSE 0 END) as total_tunggakan")
    )
    .first();

  return result;
};