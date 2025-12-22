import masterkategoriSiswaRoutes from "./routes/masterKategoriSiswaRoutes.js";
import masterKomponenBiayaRoutes from "./routes/masterKomponenBiayaRoutes.js";
import mastertarifBiayaRoutes from "./routes/tarifBiayaRoutes.js";
import tagihanSiswaRoutes from "./routes/tagihanSiswaRoutes.js";
import pembayaranSiswaRoutes from "./routes/pembayaranRoutes.js";
import midtransRoutes from "./routes/midtransRoutes.js";

app.use("/api/master-kategori-siswa", masterkategoriSiswaRoutes);
app.use("/api/master-komponen-biaya", masterKomponenBiayaRoutes);
app.use("/api/master-tarif-biaya", mastertarifBiayaRoutes);
app.use("/api/tagihan", tagihanSiswaRoutes);
app.use("/api/pembayaran", pembayaranSiswaRoutes);
app.use("/api/midtrans", midtransRoutes);