import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  useGetVideoInfo, 
  useDownloadAudio 
} from "@workspace/api-client-react";
import { 
  Link2, 
  Search, 
  Loader2, 
  Music, 
  Clock, 
  User, 
  Download, 
  AlertCircle,
  FileAudio,
  FileVideo,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { cn, formatDuration, formatFileSize } from "@/lib/utils";
import type { DownloadRequestFormat } from "@workspace/api-client-react/src/generated/api.schemas";

const AUDIO_FORMATS: { value: DownloadRequestFormat; label: string }[] = [
  { value: "mp3",  label: "MP3 — Best Compatibility" },
  { value: "m4a",  label: "M4A — Apple AAC" },
  { value: "wav",  label: "WAV — Lossless" },
  { value: "flac", label: "FLAC — Lossless Compressed" },
  { value: "ogg",  label: "OGG — Open Format" },
  { value: "opus", label: "Opus — Modern Compressed" },
];

const VIDEO_FORMATS: { value: DownloadRequestFormat; label: string }[] = [
  { value: "mp4",  label: "MP4 — Universal Video" },
  { value: "webm", label: "WebM — Web Optimized" },
  { value: "mkv",  label: "MKV — High Quality" },
  { value: "avi",  label: "AVI — Classic Format" },
];

const VIDEO_FORMAT_SET = new Set<DownloadRequestFormat>(["mp4", "webm", "mkv", "avi"]);

export function ConverterInterface() {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState<DownloadRequestFormat>("mp3");
  const [isDone, setIsDone] = useState(false);

  const infoMutation = useGetVideoInfo();
  const downloadMutation = useDownloadAudio();

  const isVideoFormat = VIDEO_FORMAT_SET.has(format);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsDone(false);
    downloadMutation.reset();
    infoMutation.mutate({ data: { url } });
  };

  const handleConvert = () => {
    if (!url.trim()) return;
    downloadMutation.mutate({ data: { url, format } }, {
      onSuccess: () => setIsDone(true),
    });
  };

  const handleReset = () => {
    setUrl("");
    setIsDone(false);
    infoMutation.reset();
    downloadMutation.reset();
  };

  const isAnalyzing = infoMutation.isPending;
  const isConverting = downloadMutation.isPending;
  const videoInfo = infoMutation.data;
  const result = downloadMutation.data;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* URL Input */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-2 md:p-3 relative z-20"
      >
        <form onSubmit={handleAnalyze} className="relative flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full flex-1 flex items-center">
            <Link2 className="absolute left-5 text-muted-foreground w-5 h-5 pointer-events-none" />
            <input
              type="url"
              placeholder="Paste YouTube URL here (e.g. https://youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (isDone) setIsDone(false);
              }}
              disabled={isAnalyzing || isConverting}
              className="w-full bg-black/20 border-transparent text-foreground placeholder:text-muted-foreground/60 h-14 md:h-16 pl-14 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-lg disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!url.trim() || isAnalyzing || isConverting || !!videoInfo}
            className={cn(
              "h-14 md:h-16 px-8 rounded-2xl font-bold text-base flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-300",
              (!url.trim() || isAnalyzing || isConverting || !!videoInfo)
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" />Analyzing</>
            ) : videoInfo ? (
              <><CheckCircle2 className="w-5 h-5 text-green-400" />Analyzed</>
            ) : (
              <><Search className="w-5 h-5" />Get Info</>
            )}
          </button>
        </form>
      </motion.div>

      {/* Errors */}
      <AnimatePresence mode="wait">
        {(infoMutation.isError || downloadMutation.isError) && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 24 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-start gap-3 text-destructive-foreground">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive">Operation Failed</h4>
                <p className="text-sm opacity-80 mt-1">
                  {infoMutation.error?.message || downloadMutation.error?.message || "An unexpected error occurred. Please try again."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Info & Controls */}
      <AnimatePresence mode="wait">
        {videoInfo && !infoMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Thumbnail */}
            <div className="lg:col-span-2 space-y-4">
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl shadow-black/50 border border-border/50 group bg-card">
                {videoInfo.thumbnail ? (
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary">
                    <Music className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-white border border-white/10 flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary" />
                  {formatDuration(videoInfo.duration)}
                </div>
              </div>
            </div>

            {/* Details & Action */}
            <div className="lg:col-span-3 glass-panel rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-display leading-tight line-clamp-2" title={videoInfo.title}>
                  {videoInfo.title}
                </h2>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span className="font-medium truncate max-w-[200px]">{videoInfo.author}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border/50">
                {!isDone ? (
                  <div className="flex flex-col gap-4">
                    {/* Format type tabs */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormat("mp3")}
                        disabled={isConverting}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                          !isVideoFormat
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <FileAudio className="w-4 h-4" />
                        Audio
                      </button>
                      <button
                        onClick={() => setFormat("mp4")}
                        disabled={isConverting}
                        className={cn(
                          "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                          isVideoFormat
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <FileVideo className="w-4 h-4" />
                        Video
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground ml-1">Select Format</label>
                        <div className="relative">
                          <select
                            value={format}
                            onChange={(e) => setFormat(e.target.value as DownloadRequestFormat)}
                            disabled={isConverting}
                            className="w-full appearance-none bg-secondary border border-border/50 text-foreground h-14 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-medium cursor-pointer disabled:opacity-50"
                          >
                            {!isVideoFormat ? (
                              AUDIO_FORMATS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))
                            ) : (
                              VIDEO_FORMATS.map(f => (
                                <option key={f.value} value={f.value}>{f.label}</option>
                              ))
                            )}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleConvert}
                        disabled={isConverting}
                        className={cn(
                          "h-14 px-8 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden group min-w-[200px]",
                          isConverting
                            ? "bg-primary/20 text-primary cursor-wait"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0"
                        )}
                      >
                        {isConverting ? (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Converting...
                          </>
                        ) : (
                          <>
                            {isVideoFormat
                              ? <FileVideo className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              : <FileAudio className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            }
                            Convert & Download
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col sm:flex-row items-center gap-4 bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                  >
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-green-400 font-semibold">
                        <CheckCircle2 className="w-5 h-5" />
                        Conversion Complete!
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result?.filename} <span className="mx-2 opacity-50">•</span> {formatFileSize(result?.fileSize)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleReset}
                        className="h-12 w-12 shrink-0 flex items-center justify-center rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                        title="Convert another"
                      >
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <a
                        href={result?.downloadUrl}
                        download={result?.filename}
                        className="h-12 px-6 rounded-xl bg-green-500 hover:bg-green-400 text-black font-bold flex items-center justify-center gap-2 flex-1 sm:flex-initial transition-colors shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                      >
                        <Download className="w-5 h-5" />
                        Download File
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
