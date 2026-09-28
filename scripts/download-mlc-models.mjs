import fs from "fs";
import http from "http";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";
import { prebuiltAppConfig } from "@mlc-ai/web-llm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// Modelos usados para rodar no navegador, adaptado inclusive a capacidade do dispositivo que esta acessando
const MODEL_IDS = [
  "SmolLM2-360M-Instruct-q4f32_1-MLC",
  "Llama-3.2-1B-Instruct-q4f32_1-MLC",
  "Llama-3.2-1B-Instruct-q4f16_1-MLC",
  "Llama-3.2-3B-Instruct-q4f16_1-MLC",
  "Phi-3.5-mini-instruct-q4f16_1-MLC",
  "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
];

const MODELS = MODEL_IDS.map((modelId) => {
  const record = prebuiltAppConfig.model_list.find(
    (m) => m.model_id === modelId,
  );
  if (!record) {
    throw new Error(`model_id não encontrado no prebuiltAppConfig: ${modelId}`);
  }
  return {
    modelId,
    repo: new URL(record.model).pathname.replace(/^\/+|\/+$/g, ""),
    modelLib: record.model_lib.split("/").pop(),
    libUrl: record.model_lib,
  };
});

const WHISPER_MODELS = [
  { modelId: "Xenova/whisper-tiny", repo: "Xenova/whisper-tiny" },
];

function getClient(url) {
  return url.startsWith("https:") ? https : http;
}

function request(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const client = getClient(url);
    client
      .get(url, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location &&
          maxRedirects > 0
        ) {
          const next = new URL(res.headers.location, url).toString();
          res.resume();
          resolve(request(next, maxRedirects - 1));
          return;
        }
        resolve(res);
      })
      .on("error", reject);
  });
}

async function getJson(url) {
  const res = await request(url);
  if (res.statusCode !== 200) {
    throw new Error(`HTTP ${res.statusCode}: ${url}`);
  }
  const chunks = [];
  for await (const chunk of res) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function downloadFile(url, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const res = await request(url);
  if (res.statusCode !== 200) {
    throw new Error(`HTTP ${res.statusCode}: ${url}`);
  }

  const file = fs.createWriteStream(dest);
  return new Promise((resolve, reject) => {
    res.pipe(file);
    file.on("finish", () => file.close(resolve));
    file.on("error", (err) => {
      file.close(() => {});
      fs.unlink(dest, () => {});
      reject(err);
    });
    res.on("error", (err) => {
      file.close(() => {});
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadHfFiles(repo, targetDir) {
  console.log(`[download-mlc] listing ${repo}...`);
  const tree = await getJson(
    `https://huggingface.co/api/models/${repo}/tree/main/`,
  );

  for (const item of tree) {
    if (item.type !== "file") continue;
    if ([".gitattributes", "README.md", "logs.txt"].includes(item.path))
      continue;
    const dest = path.join(targetDir, item.path);
    const localSize = fs.existsSync(dest) ? fs.statSync(dest).size : -1;
    if (localSize === item.size) {
      console.log(`[download-mlc] skip: ${path.relative(root, dest)}`);
      continue;
    }
    if (localSize >= 0) {
      console.log(
        `[download-mlc] re-downloading (size mismatch): ${path.relative(root, dest)}`,
      );
      fs.unlinkSync(dest);
    }
    const url = `https://huggingface.co/${repo}/resolve/main/${item.path}?download=true`;
    console.log(`[download-mlc] downloading: ${path.relative(root, dest)}...`);
    await downloadFile(url, dest);
    console.log(`[download-mlc] saved: ${path.relative(root, dest)}`);
  }
}

async function main() {
  for (const { modelId, repo, modelLib, libUrl } of MODELS) {
    const targetDir = path.join(
      root,
      "public",
      "models",
      modelId,
      "resolve",
      "main",
    );
    await downloadHfFiles(repo, targetDir);

    const libDir = path.join(root, "public", "models", "libs");
    const libDest = path.join(libDir, modelLib);
    if (!fs.existsSync(libDest)) {
      fs.mkdirSync(libDir, { recursive: true });
      console.log(
        `[download-mlc] downloading: ${path.relative(root, libDest)}...`,
      );
      await downloadFile(libUrl, libDest);
      console.log(`[download-mlc] saved: ${path.relative(root, libDest)}`);
    } else {
      console.log(`[download-mlc] skip: ${path.relative(root, libDest)}`);
    }
  }

  for (const { repo } of WHISPER_MODELS) {
    const targetDir = path.join(root, "public", "models", ...repo.split("/"));
    await downloadHfFiles(repo, targetDir);
  }
}

main().catch((err) => {
  console.error("[download-mlc] error:", err.message);
  process.exit(1);
});
