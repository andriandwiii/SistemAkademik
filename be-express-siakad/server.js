import { config } from "dotenv";
import app from "./src/app.js";

config();

const port = process.env.PORT || 8000;

// Cek apakah sedang berjalan di environment serverless (Vercel) atau Lokal
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server running on localhost:${port}`);
  });
}

// WAJIB: Ekspor app agar Vercel bisa menggunakannya sebagai Serverless Function
export default app;