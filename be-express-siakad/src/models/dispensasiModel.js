import { db } from "../core/config/knex.js";

const table = "dispensasi";

/**
 * Get all dispensasi with filters
 */
export const getAllDispensasi = async (filters = {}) => {
  let query = db(`${table} as d`)
    .leftJoin("master_siswa as s", "d.NIS", "s.NIS")
    .leftJoin("tagihan_siswa as t", "d.TAGIHAN_ID", "t.TAGIHAN_ID")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "d.*",
      "s.NAMA as NAMA_SISWA",
      "k.NAMA_KOMPONEN",
      "t.NOMINAL as NOMINAL_TAGIHAN",
      "t.NOMOR_TAGIHAN"
    );

  if (filters.nis) query.where("d.NIS", filters.nis);
  if (filters.status) query.where("d.STATUS", filters.status);
  if (filters.jenis) query.where("d.JENIS", filters.jenis);

  return query.orderBy("d.created_at", "desc");
};

/**
 * Get dispensasi by ID
 */
export const getDispensasiById = async (dispensasiId) => {
  return db(`${table} as d`)
    .leftJoin("master_siswa as s", "d.NIS", "s.NIS")
    .leftJoin("tagihan_siswa as t", "d.TAGIHAN_ID", "t.TAGIHAN_ID")
    .leftJoin("master_komponen_biaya as k", "t.KOMPONEN_ID", "k.KOMPONEN_ID")
    .select(
      "d.*",
      "s.NAMA as NAMA_SISWA",
      "s.NO_TELP",
      "k.NAMA_KOMPONEN",
      "t.NOMINAL as NOMINAL_TAGIHAN"
    )
    .where("d.DISPENSASI_ID", dispensasiId)
    .first();
};

/**
 * Create dispensasi
 */
export const createDispensasi = async (data) => {
  // Generate DISPENSASI_ID
  const last = await db(table)
    .select("DISPENSASI_ID")
    .orderBy("id", "desc")
    .first();

  let nextNumber = 1;
  if (last && last.DISPENSASI_ID) {
    const numericPart = parseInt(last.DISPENSASI_ID.replace("DISP", ""), 10);
    if (!isNaN(numericPart)) nextNumber = numericPart + 1;
  }
  const dispensasiId = `DISP${nextNumber.toString().padStart(8, "0")}`;
  const nomorDispensasi = `DISP${nextNumber.toString().padStart(8, "0")}`;

  const [id] = await db(table).insert({
    ...data,
    DISPENSASI_ID: dispensasiId,
    NOMOR_DISPENSASI: nomorDispensasi
  });

  return db(table).where("id", id).first();
};

/**
 * Update dispensasi
 */
export const updateDispensasi = async (dispensasiId, data) => {
  await db(table).where("DISPENSASI_ID", dispensasiId).update(data);
  return db(table).where("DISPENSASI_ID", dispensasiId).first();
};

/**
 * Approve dispensasi
 */
export const approveDispensasi = async (dispensasiId, userId, catatanApproval = null) => {
  return db.transaction(async (trx) => {
    const dispensasi = await trx(table).where("DISPENSASI_ID", dispensasiId).first();

    if (!dispensasi) {
      throw new Error("Dispensasi tidak ditemukan");
    }

    // Update status dispensasi
    await trx(table)
      .where("DISPENSASI_ID", dispensasiId)
      .update({
        STATUS: "DISETUJUI",
        DISETUJUI_OLEH: userId,
        TGL_DISETUJUI: new Date(),
        CATATAN_APPROVAL: catatanApproval
      });

    // Jika POTONGAN, update tagihan
    if (dispensasi.JENIS === "POTONGAN_TETAP" || dispensasi.JENIS === "POTONGAN_PERSEN") {
      const tagihan = await trx("tagihan_siswa")
        .where("TAGIHAN_ID", dispensasi.TAGIHAN_ID)
        .first();

      let potongan = 0;
      if (dispensasi.JENIS === "POTONGAN_TETAP") {
        potongan = dispensasi.NILAI_POTONGAN;
      } else {
        potongan = (tagihan.NOMINAL * dispensasi.PERSEN_POTONGAN) / 100;
      }

      await trx("tagihan_siswa")
        .where("TAGIHAN_ID", dispensasi.TAGIHAN_ID)
        .update({
          POTONGAN: potongan,
          TOTAL: tagihan.NOMINAL - potongan
        });
    }

    // Jika CICILAN, buat jadwal cicilan
    if (dispensasi.JENIS === "CICILAN" && dispensasi.JUMLAH_CICILAN > 0) {
      const tagihan = await trx("tagihan_siswa")
        .where("TAGIHAN_ID", dispensasi.TAGIHAN_ID)
        .first();

      const nominalPerCicilan = Math.ceil(tagihan.TOTAL / dispensasi.JUMLAH_CICILAN);
      const today = new Date();

      for (let i = 1; i <= dispensasi.JUMLAH_CICILAN; i++) {
        const jatuhTempo = new Date(today);
        jatuhTempo.setMonth(jatuhTempo.getMonth() + i);

        // Generate CICILAN_ID
        const lastCicilan = await trx("cicilan")
          .select("CICILAN_ID")
          .orderBy("id", "desc")
          .first();

        let nextNum = 1;
        if (lastCicilan && lastCicilan.CICILAN_ID) {
          const numPart = parseInt(lastCicilan.CICILAN_ID.replace("CIC", ""), 10);
          if (!isNaN(numPart)) nextNum = numPart + 1;
        }
        const cicilanId = `CIC${nextNum.toString().padStart(10, "0")}`;

        await trx("cicilan").insert({
          CICILAN_ID: cicilanId,
          TAGIHAN_ID: dispensasi.TAGIHAN_ID,
          CICILAN_KE: i,
          NOMINAL: i === dispensasi.JUMLAH_CICILAN ? 
            tagihan.TOTAL - (nominalPerCicilan * (i - 1)) : // Cicilan terakhir ambil sisa
            nominalPerCicilan,
          TGL_JATUH_TEMPO: jatuhTempo,
          STATUS: "BELUM_BAYAR"
        });
      }

      // Update status tagihan menjadi DISPENSASI
      await trx("tagihan_siswa")
        .where("TAGIHAN_ID", dispensasi.TAGIHAN_ID)
        .update({ STATUS: "DISPENSASI" });
    }

    // Jika PEMBEBASAN, update tagihan menjadi LUNAS dengan potongan 100%
    if (dispensasi.JENIS === "PEMBEBASAN") {
      const tagihan = await trx("tagihan_siswa")
        .where("TAGIHAN_ID", dispensasi.TAGIHAN_ID)
        .first();

      await trx("tagihan_siswa")
        .where("TAGIHAN_ID", dispensasi.TAGIHAN_ID)
        .update({
          POTONGAN: tagihan.NOMINAL,
          TOTAL: 0,
          STATUS: "LUNAS",
          TGL_LUNAS: new Date()
        });
    }

    return trx(table).where("DISPENSASI_ID", dispensasiId).first();
  });
};

/**
 * Reject dispensasi
 */
export const rejectDispensasi = async (dispensasiId, userId, catatanApproval = null) => {
  await db(table)
    .where("DISPENSASI_ID", dispensasiId)
    .update({
      STATUS: "DITOLAK",
      DISETUJUI_OLEH: userId,
      TGL_DISETUJUI: new Date(),
      CATATAN_APPROVAL: catatanApproval
    });

  return db(table).where("DISPENSASI_ID", dispensasiId).first();
};

/**
 * Delete dispensasi
 */
export const deleteDispensasi = async (dispensasiId) => {
  const dispensasi = await db(table).where("DISPENSASI_ID", dispensasiId).first();
  
  if (!dispensasi) return null;
  
  if (dispensasi.STATUS === "DISETUJUI") {
    throw new Error("Tidak dapat menghapus dispensasi yang sudah disetujui");
  }

  await db(table).where("DISPENSASI_ID", dispensasiId).del();
  return dispensasi;
};