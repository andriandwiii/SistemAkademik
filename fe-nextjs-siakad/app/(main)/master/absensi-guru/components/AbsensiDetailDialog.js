"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Image } from "primereact/image";

const RAW_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100";
const apiBaseClean = RAW_API.replace(/\/+$/g, "");

const buildApiUrl = (base) => {
  return base.match(/\/api\/?$/i) ? base.replace(/\/+$/g, "") : `${base}/api`;
};

const API_PREFIX = buildApiUrl(apiBaseClean);
const STATIC_PREFIX = apiBaseClean.replace(/\/api\/?$/i, "");

const AbsensiDetailDialog = ({ visible, onHide, data }) => {
  const [guruDetail, setGuruDetail] = useState(null);
  const [loadingGuru, setLoadingGuru] = useState(true);

  const fetchingRef = useRef(false);
  const cancelSourceRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const normalizeNip = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      return (
        obj.NIP ??
        obj.nip ??
        obj.nip_guru ??
        obj.nip_number ??
        obj.nip_no ??
        obj.id_nip ??
        null
      );
    };

    const normalizeName = (obj) => {
      if (!obj || typeof obj !== "object") return null;
      return (
        obj.NAMA ??
        obj.nama ??
        obj.name ??
        obj.full_name ??
        obj.display_name ??
        null
      );
    };

    const pickGuruFromPayload = (payload, nip) => {
      if (!payload) return null;

      if (!Array.isArray(payload)) {
        const pNip = normalizeNip(payload);
        if (!pNip || String(pNip) === String(nip)) return payload;
        return null;
      }

      const exactMatches = payload.filter((it) => {
        const itNip = normalizeNip(it);
        return itNip && String(itNip) === String(nip);
      });

      if (exactMatches.length === 1) return exactMatches[0];
      if (exactMatches.length > 1) {
        console.warn("Multiple exact NIP matches found — using first one", exactMatches);
        return exactMatches[0];
      }

      if (data?.NAMA_GURU) {
        const target = String(data.NAMA_GURU).trim().toLowerCase();
        const nameMatch = payload.find((it) => {
          const itName = String(normalizeName(it) ?? "").trim().toLowerCase();
          return itName && itName === target;
        });
        if (nameMatch) {
          console.log("Found guru by exact name match");
          return nameMatch;
        }
      }

      if (payload.length === 1) {
        return payload[0];
      }

      return null;
    };

    const getImageSrc = (path) => {
      if (!path || path === "-" || path === "null") return null;
      if (typeof path !== "string") return null;
      if (path.startsWith("data:image")) return path;
      if (/^https?:\/\//i.test(path)) return path;

      const cleaned = path.startsWith("/") ? path.slice(1) : path;
      return `${STATIC_PREFIX}/${cleaned}`;
    };

    const fetchGuru = async (nip) => {
      if (fetchingRef.current) {
        console.log("Fetch already in progress — skipping duplicate call");
        return;
      }
      fetchingRef.current = true;
      setLoadingGuru(true);

      cancelSourceRef.current = axios.CancelToken.source();

      const tryUrls = [
        `${API_PREFIX}/master-guru?nip=${encodeURIComponent(nip)}`,
        `${STATIC_PREFIX}/master-guru?nip=${encodeURIComponent(nip)}`,
      ];

      let lastError = null;

      try {
        for (const url of tryUrls) {
          if (!mounted) break;
          try {
            console.log("GET", url);
            const resp = await axios.get(url, {
              cancelToken: cancelSourceRef.current.token,
            });

            const payload = resp?.data?.data ?? resp?.data ?? null;

            if (payload === null || payload === undefined) {
              console.warn("Response ok tapi payload kosong:", url, resp?.data);
              continue;
            }

            const chosen = pickGuruFromPayload(payload, nip);

            if (chosen) {
              const normalized = {
                ...chosen,
                NAMA: normalizeName(chosen) ?? data?.NAMA_GURU ?? "Nama Tidak Ditemukan",
                NIP: normalizeNip(chosen) ?? nip,
                FOTO: chosen.FOTO ?? chosen.foto ?? chosen.avatar ?? chosen.image ?? null,
                EMAIL: chosen.EMAIL ?? chosen.email ?? null,
                GENDER: chosen.GENDER ?? chosen.gender ?? null,
                NO_TELP: chosen.NO_TELP ?? chosen.no_telp ?? chosen.phone ?? null,
              };

              if (!mounted) return;
              setGuruDetail(normalized);
              console.log("Guru data loaded from", url, normalized);
              setLoadingGuru(false);
              fetchingRef.current = false;
              return;
            } else {
              console.warn("Tidak menemukan record yang cocok di:", url);
              continue;
            }
          } catch (err) {
            if (axios.isCancel(err)) {
              console.log("Axios request canceled:", url);
              lastError = err;
              break;
            }
            lastError = err;
            const status = err?.response?.status;
            if (status === 404) {
              console.warn(`404 at ${url} (diabaikan, mencoba fallback)`);
              continue;
            } else {
              console.error(`Error saat memanggil ${url}:`, err?.message ?? err);
              continue;
            }
          }
        }

        console.error("Semua percobaan fetch guru gagal.", lastError?.message ?? lastError);

        if (mounted) {
          if (data?.NAMA_GURU) {
            setGuruDetail({
              NAMA: data.NAMA_GURU,
              NIP: data.NIP,
              FOTO: null,
              EMAIL: null,
              GENDER: null,
              NO_TELP: null,
            });
            console.log("Menggunakan fallback dari data absensi:", data.NAMA_GURU);
          } else {
            setGuruDetail(null);
          }
          setLoadingGuru(false);
        }
      } finally {
        fetchingRef.current = false;
      }
    };

    if (visible && data?.NIP) {
      fetchGuru(data.NIP);
    } else if (!visible) {
      setGuruDetail(null);
      setLoadingGuru(true);
    }

    return () => {
      mounted = false;
      if (cancelSourceRef.current) {
        try {
          cancelSourceRef.current.cancel("Component unmounted — cancel fetchGuru");
        } catch (e) {}
        cancelSourceRef.current = null;
      }
      fetchingRef.current = false;
    };
  }, [visible, data?.NIP]);

  const fallbackSvgDataUri = (w = 150, h = 150, label = "No Image") =>
    `data:image/svg+xml;base64,${typeof window !== "undefined" ? btoa(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'><rect width='100%' height='100%' fill='#e0e0e0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='14' fill='#999'>${label}</text></svg>`
    ) : ""}`;

  const InfoItem = ({ label, value, icon, isLink = false }) => (
    <div className="mb-3">
      <span className="text-500 text-sm font-medium block mb-1">
        {icon && <i className={`${icon} mr-1`}></i>}
        {label}
      </span>
      {isLink && value ? (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800 font-semibold no-underline flex align-items-center gap-1"
        >
          <i className="pi pi-map-marker"></i> {value}
        </a>
      ) : (
        <span className="text-900 font-semibold text-lg">{value ?? "-"}</span>
      )}
    </div>
  );

  const getImageSrc = (path) => {
    if (!path || path === "-" || path === "null") return null;
    if (typeof path !== "string") return null;
    if (path.startsWith("data:image")) return path;
    if (/^https?:\/\//i.test(path)) return path;
    const cleaned = path.startsWith("/") ? path.slice(1) : path;
    return `${STATIC_PREFIX}/${cleaned}`;
  };

  return (
    <Dialog
      header={
        <div className="flex align-items-center gap-2">
          <i className="pi pi-id-card text-primary text-2xl"></i>
          <span className="font-bold text-xl">Detail Absensi Guru</span>
        </div>
      }
      visible={visible}
      style={{ width: "900px", maxWidth: "95vw" }}
      modal
      draggable={false}
      onHide={onHide}
      className="p-fluid"
      blockScroll
    >
      {data ? (
        <div className="pb-2">
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-2 surface-50">
            {loadingGuru ? (
              <div className="flex gap-3 align-items-center">
                <Skeleton shape="circle" size="5rem" className="mr-2" />
                <div style={{ flex: "1" }}>
                  <Skeleton width="100%" className="mb-2" />
                  <Skeleton width="75%" />
                </div>
              </div>
            ) : (
              <div className="grid align-items-center">
                <div className="col-12 md:col-3 text-center">
                  <div className="relative inline-block">
                    {guruDetail?.FOTO && getImageSrc(guruDetail.FOTO) ? (
                      <Image
                        src={getImageSrc(guruDetail.FOTO)}
                        alt="Profil"
                        width="100"
                        imageClassName="border-circle shadow-4"
                        imageStyle={{ objectFit: "cover", width: "100px", height: "100px" }}
                        preview
                        onError={(e) => {
                          try {
                            const target = e?.target ?? e;
                            if (target) {
                              target.onerror = null;
                              target.src = fallbackSvgDataUri(100, 100, "Profil");
                            }
                          } catch (err) {
                            console.error("Error setting fallback image", err);
                          }
                        }}
                      />
                    ) : (
                      <img
                        src={fallbackSvgDataUri(100, 100, "Profil")}
                        alt="Profil Default"
                        className="border-circle shadow-4"
                        style={{ objectFit: "cover", width: "100px", height: "100px" }}
                      />
                    )}
                  </div>
                </div>

                <div className="col-12 md:col-9">
                  <h2 className="mt-0 mb-1 text-primary">
                    {guruDetail?.NAMA || data.NAMA_GURU || "Nama Tidak Ditemukan"}
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-3 align-items-center">
                    <Tag value={data.NIP} icon="pi pi-id-card" severity="info" className="text-sm" />
                    {guruDetail?.GENDER && (
                      <Tag
                        value={guruDetail.GENDER === "L" ? "Laki-laki" : "Perempuan"}
                        icon={guruDetail.GENDER === "L" ? "pi pi-mars" : "pi pi-venus"}
                        severity="warning"
                        className="text-sm"
                      />
                    )}
                    {guruDetail?.NO_TELP && (
                      <span className="text-600 text-sm flex align-items-center gap-1 ml-2">
                        <i className="pi pi-phone"></i> {guruDetail.NO_TELP}
                      </span>
                    )}
                  </div>

                  <div className="text-600">
                    <i className="pi pi-envelope mr-1"></i> {guruDetail?.EMAIL || "-"}
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Divider align="center">
            <span className="bg-white px-3 text-700 font-bold border-1 border-300 border-round p-1">
              Data Kehadiran
            </span>
          </Divider>

          <div className="flex justify-content-between align-items-center mb-4 px-2">
            <div>
              <span className="text-500 block text-sm">Tanggal Absen</span>
              <span className="text-xl font-bold">
                {new Date(data.TANGGAL).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="text-right">
              <span className="text-500 block text-sm mb-1">Status</span>
              <div className="flex gap-2 justify-content-end">
                <Tag
                  value={data.STATUS}
                  severity={
                    data.STATUS === "Hadir" ? "success" : data.STATUS === "Sakit" ? "warning" : "danger"
                  }
                  className="text-lg px-3 py-2"
                />
                {data.TERLAMBAT === 1 && <Tag value="TERLAMBAT" severity="danger" icon="pi pi-clock" />}
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="col-12 md:col-6">
              <Card className="h-full border-top-3 border-green-500 shadow-2">
                <div className="text-center mb-3">
                  <Tag value="ABSEN MASUK" severity="success" className="w-full text-base py-2" />
                </div>

                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-1">{data.JAM_MASUK ? data.JAM_MASUK.slice(0, 5) : "--:--"}</div>
                  <small className="text-500">Waktu Masuk</small>
                </div>

                <div className="mb-4 text-center">
                  <span className="block text-500 text-sm mb-2">Foto Bukti (Selfie)</span>
                  {data.FOTO_MASUK && getImageSrc(data.FOTO_MASUK) ? (
                    <Image
                      src={getImageSrc(data.FOTO_MASUK)}
                      alt="Foto Masuk"
                      width="150"
                      imageClassName="shadow-2 border-round"
                      imageStyle={{ objectFit: "cover", maxHeight: "200px" }}
                      preview
                      onError={(e) => {
                        try {
                          const target = e?.target ?? e;
                          if (target) {
                            target.onerror = null;
                            target.src = fallbackSvgDataUri(150, 150, "Foto Masuk");
                          }
                        } catch (err) {
                          console.error("Error setting fallback", err);
                        }
                      }}
                    />
                  ) : (
                    <div className="surface-200 p-4 border-round text-500">
                      <i className="pi pi-image text-2xl block mb-2"></i>
                      Tidak ada foto
                    </div>
                  )}
                </div>

                <InfoItem label="Lokasi Masuk" value={data.LOKASI_MASUK} icon="pi pi-map" isLink={true} />

                <div className="mt-3">
                  <span className="text-500 text-sm font-medium block mb-2">Tanda Tangan</span>
                  {data.TANDA_TANGAN_MASUK && data.TANDA_TANGAN_MASUK !== "-" ? (
                    <div className="surface-50 border-1 border-300 border-round p-2 flex justify-content-center">
                      <Image
                        src={getImageSrc(data.TANDA_TANGAN_MASUK) ?? data.TANDA_TANGAN_MASUK}
                        alt="TTD Masuk"
                        width="120"
                        imageStyle={{ maxHeight: "80px", objectFit: "contain" }}
                        preview
                      />
                    </div>
                  ) : (
                    <span className="text-400">-</span>
                  )}
                </div>
              </Card>
            </div>

            <div className="col-12 md:col-6">
              <Card className="h-full border-top-3 border-blue-500 shadow-2">
                <div className="text-center mb-3">
                  <Tag value="ABSEN PULANG" severity="info" className="w-full text-base py-2" />
                </div>

                <div className="text-center mb-4">
                  <div className={`text-4xl font-bold mb-1 ${data.JAM_KELUAR ? "text-blue-600" : "text-gray-400"}`}>
                    {data.JAM_KELUAR ? data.JAM_KELUAR.slice(0, 5) : "--:--"}
                  </div>
                  <small className="text-500">Waktu Pulang</small>
                </div>

                <div className="mb-4 text-center p-3">
                  <div style={{ height: "100px" }} className="flex align-items-center justify-content-center text-500 font-italic">
                    Absen pulang
                    <br />
                    tidak memerlukan foto
                  </div>
                </div>

                <InfoItem label="Lokasi Pulang" value={data.LOKASI_KELUAR} icon="pi pi-map" isLink={true} />

                <div className="mt-3">
                  <span className="text-500 text-sm font-medium block mb-2">Tanda Tangan</span>
                  {data.TANDA_TANGAN_KELUAR && data.TANDA_TANGAN_KELUAR !== "-" ? (
                    <div className="surface-50 border-1 border-300 border-round p-2 flex justify-content-center">
                      <Image
                        src={getImageSrc(data.TANDA_TANGAN_KELUAR) ?? data.TANDA_TANGAN_KELUAR}
                        alt="TTD Pulang"
                        width="120"
                        imageStyle={{ maxHeight: "80px", objectFit: "contain" }}
                        preview
                      />
                    </div>
                  ) : (
                    <span className="text-400 text-sm font-italic">Tidak ada tanda tangan</span>
                  )}
                </div>
              </Card>
            </div>

            {data.KETERANGAN && data.KETERANGAN !== "-" && (
              <div className="col-12 mt-2">
                <Card className="surface-100 border-1 border-300 shadow-none">
                  <div className="flex gap-2">
                    <i className="pi pi-info-circle text-xl text-primary mt-1"></i>
                    <div>
                      <span className="font-bold block text-primary">Keterangan Tambahan:</span>
                      <p className="m-0 text-900">{data.KETERANGAN}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <i className="pi pi-spin pi-spinner text-4xl text-primary mb-3"></i>
          <p className="text-600">Memuat data...</p>
        </div>
      )}
    </Dialog>
  );
};

export default AbsensiDetailDialog;
