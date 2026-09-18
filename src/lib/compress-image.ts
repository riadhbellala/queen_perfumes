import imageCompression from "browser-image-compression";

export type CompressImageResult = {
  file: File;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  originalSizeLabel: string;
  compressedSizeLabel: string;
};

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
  return `${Math.round(bytes / 1024)} Ko`;
}

function toWebpName(originalName: string): string {
  return originalName.replace(/\.[^./]+$/, "") + ".webp";
}

/**
 * Compresses an image client-side before it ever reaches Supabase Storage:
 * downscales to at most 1600px on the longest side, converts to WebP, and
 * iterates quality/size down toward ~300KB (the library's own maxIteration
 * loop handles the "iterative" part). Falls back to the original file if
 * compression throws for any reason — a corrupt/unsupported file should
 * never block the upload entirely.
 */
export async function compressImage(file: File): Promise<CompressImageResult> {
  const originalSizeBytes = file.size;

  try {
    const compressed = await imageCompression(file, {
      maxWidthOrHeight: 1600,
      maxSizeMB: 0.3,
      fileType: "image/webp",
      useWebWorker: true,
      initialQuality: 0.8,
    });

    const compressedFile = new File([compressed], toWebpName(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });

    return {
      file: compressedFile,
      originalSizeBytes,
      compressedSizeBytes: compressedFile.size,
      originalSizeLabel: formatSize(originalSizeBytes),
      compressedSizeLabel: formatSize(compressedFile.size),
    };
  } catch (err) {
    console.warn("Image compression failed, uploading the original file instead:", err);
    return {
      file,
      originalSizeBytes,
      compressedSizeBytes: originalSizeBytes,
      originalSizeLabel: formatSize(originalSizeBytes),
      compressedSizeLabel: formatSize(originalSizeBytes),
    };
  }
}
