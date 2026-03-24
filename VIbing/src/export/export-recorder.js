export function createExportRecorder(canvas, options = {}) {
  const isSupported = typeof MediaRecorder !== "undefined" && typeof canvas.captureStream === "function";
  let mediaRecorder = null;
  let chunks = [];
  let downloadUrl = "";
  let filename = "";
  let stream = null;

  return {
    isSupported,

    getState() {
      const isRecording = mediaRecorder?.state === "recording";
      const isReady = !isRecording && Boolean(downloadUrl);
      return {
        isRecording,
        isSupported,
        label: isSupported
          ? (isRecording ? "Recording canvas stream" : isReady ? "Video ready. Download started automatically." : "Recorder idle")
          : "Recorder unavailable in this browser",
        downloadUrl,
        filename
      };
    },

    toggle() {
      if (!isSupported) {
        return this.getState();
      }

      if (mediaRecorder?.state === "recording") {
        mediaRecorder.stop();
        const state = this.getState();
        options.onStateChange?.(state);
        return state;
      }

      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
        downloadUrl = "";
        filename = "";
      }

      chunks = [];
      filename = createFilename();
      stream = canvas.captureStream(60);
      mediaRecorder = new MediaRecorder(stream, { mimeType: pickMimeType() });

      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener("stop", () => {
        const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
        downloadUrl = URL.createObjectURL(blob);
        stream?.getTracks().forEach((track) => track.stop());
        triggerDownload(downloadUrl, filename);
        options.onStateChange?.(this.getState());
      });

      mediaRecorder.start(200);
      const state = this.getState();
      options.onStateChange?.(state);
      return state;
    }
  };
}

function createFilename() {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    "-",
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0")
  ].join("");

  return `vibing-${stamp}.webm`;
}

function pickMimeType() {
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || "";
}

function triggerDownload(url, filename) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
