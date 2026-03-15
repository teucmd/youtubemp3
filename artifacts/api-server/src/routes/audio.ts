import { Router, type IRouter } from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";
import os from "os";
import {
  GetVideoInfoBody,
  DownloadAudioBody,
  GetAudioFileParams,
} from "@workspace/api-zod";

const execFileAsync = promisify(execFile);
const router: IRouter = Router();

const DOWNLOADS_DIR = path.join(os.tmpdir(), "yt-audio-downloads");
const FFMPEG_DIR = "/nix/store/bmirb5k0vksybajy1wrfgq9ckgs37q0c-replit-runtime-path/bin";

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9_\-]/gi, "_").slice(0, 100);
}

const AUDIO_FORMATS = new Set(["mp3", "m4a", "wav", "ogg", "flac", "opus"]);
const VIDEO_FORMATS = new Set(["mp4", "mkv", "webm", "avi"]);

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".flac": "audio/flac",
  ".opus": "audio/opus",
  ".mp4": "video/mp4",
  ".mkv": "video/x-matroska",
  ".webm": "video/webm",
  ".avi": "video/x-msvideo",
};

router.post("/info", async (req, res) => {
  const parsed = GetVideoInfoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: "A valid YouTube URL is required" });
    return;
  }

  const { url } = parsed.data;

  try {
    const { stdout } = await execFileAsync("yt-dlp", [
      "--dump-json",
      "--no-playlist",
      url,
    ], { timeout: 30000 });

    const info = JSON.parse(stdout);
    res.json({
      title: info.title ?? "Unknown Title",
      duration: info.duration ?? 0,
      thumbnail: info.thumbnail ?? "",
      author: info.uploader ?? info.channel ?? "Unknown",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Failed to fetch video info", message });
  }
});

router.post("/download", async (req, res) => {
  const parsed = DownloadAudioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: "A valid YouTube URL and format are required" });
    return;
  }

  const { url, format } = parsed.data;
  const isAudio = AUDIO_FORMATS.has(format);
  const isVideo = VIDEO_FORMATS.has(format);

  if (!isAudio && !isVideo) {
    res.status(400).json({ error: "Invalid format", message: `Unsupported format: ${format}` });
    return;
  }

  try {
    const infoResult = await execFileAsync("yt-dlp", [
      "--dump-json",
      "--no-playlist",
      url,
    ], { timeout: 30000 });

    const info = JSON.parse(infoResult.stdout);
    const title = info.title ?? "media";
    const safeTitle = sanitizeFilename(title);
    const uniqueId = Date.now();
    const outputTemplate = path.join(DOWNLOADS_DIR, `${safeTitle}_${uniqueId}.%(ext)s`);

    let args: string[];

    if (isAudio) {
      args = [
        "--no-playlist",
        "-x",
        "--audio-format", format,
        "--audio-quality", "0",
        "--ffmpeg-location", FFMPEG_DIR,
        "-o", outputTemplate,
        url,
      ];
    } else {
      // Video: pick best video+audio combo and remux into desired container
      const videoFormatStr =
        format === "mp4"  ? "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" :
        format === "webm" ? "bestvideo[ext=webm]+bestaudio[ext=webm]/best[ext=webm]/best" :
        "bestvideo+bestaudio/best";

      args = [
        "--no-playlist",
        "-f", videoFormatStr,
        "--merge-output-format", format,
        "--ffmpeg-location", FFMPEG_DIR,
        "-o", outputTemplate,
        url,
      ];
    }

    await execFileAsync("yt-dlp", args, { timeout: 300000 });

    // Find the output file (yt-dlp may use a slightly different extension)
    const files = fs.readdirSync(DOWNLOADS_DIR)
      .filter(f => f.startsWith(`${safeTitle}_${uniqueId}`))
      .sort((a, b) => fs.statSync(path.join(DOWNLOADS_DIR, b)).mtimeMs - fs.statSync(path.join(DOWNLOADS_DIR, a)).mtimeMs);

    const finalFilename = files[0];
    if (!finalFilename) {
      throw new Error("Output file not found after conversion");
    }

    const finalPath = path.join(DOWNLOADS_DIR, finalFilename);
    const stat = fs.statSync(finalPath);

    res.json({
      filename: finalFilename,
      downloadUrl: `/api/audio/file/${encodeURIComponent(finalFilename)}`,
      title,
      fileSize: stat.size,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: "Conversion failed", message });
  }
});

router.get("/file/:filename", (req, res) => {
  const parsed = GetAudioFileParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", message: "Filename is required" });
    return;
  }

  const { filename } = parsed.data;
  const safeName = path.basename(filename);
  const filePath = path.join(DOWNLOADS_DIR, safeName);

  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "Not found", message: "File not found or expired" });
    return;
  }

  const ext = path.extname(safeName).toLowerCase();
  res.setHeader("Content-Type", MIME_TYPES[ext] ?? "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);
  res.sendFile(filePath);
});

export default router;
