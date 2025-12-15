import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const root = process.cwd();

function loadEnvFile(fileName: string, override = false) {
  const filePath = path.resolve(root, fileName);
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override });
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local", true);
