import { toast } from "react-hot-toast";

export async function fileToBase64AndCompress(file: File, maxDim: number = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const result = event.target?.result as string;

      // Determine size of the base64 string
      const sizeMb = (result.length * (3/4)) / (1024 * 1024);
      // If image is already smaller than 0.5MB, just return it directly to avoid Canvas issues
      if (sizeMb < 0.5) {
        resolve(result);
        return;
      }

      const img = new Image();
      img.src = result;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(result); // fallback to original size Base64
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch (e) {
          console.error("Canvas compression failed, falling back to original", e);
          resolve(result);
        }
      };
      img.onerror = (err) => {
        console.error("Image loading failed in compressor, falling back to original base64", err);
        resolve(result); // Return the raw base64 instead of rejecting to avoid failures!
      };
    };
    reader.onerror = (err) => {
      reject(new Error("FileReader failed"));
    };
  });
}

/**
 * Uploads an image file to Cloudinary if credentials are set up.
 * If credentials are not set up or an error occurs, automatically falls back to compressed base64.
 */
export async function uploadImageOrFallback(
  file: File,
  fallbackMaxDim: number = 600,
  onProgress?: (progress: number) => void
): Promise<string> {
  const cloudName = (import.meta as any).env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = (import.meta as any).env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const isConfigured = cloudName && 
                       uploadPreset && 
                       cloudName !== "your_cloud_name_here" && 
                       uploadPreset !== "your_upload_preset_here" &&
                       cloudName.trim() !== "" &&
                       uploadPreset.trim() !== "";

  if (!isConfigured) {
    if (onProgress) onProgress(30);
    // Graceful fallback to compressed base64
    const base64Url = await fileToBase64AndCompress(file, fallbackMaxDim);
    if (onProgress) onProgress(100);
    return base64Url;
  }

  try {
    // Cloudinary Upload
    if (onProgress) onProgress(20);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    if (onProgress) onProgress(50);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (onProgress) onProgress(80);
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || "Failed to upload image to Cloudinary");
    }

    const data = await res.json();
    if (onProgress) onProgress(100);
    return data.secure_url;
  } catch (error) {
    console.warn("Cloudinary upload failed, falling back to compressed base64:", error);
    if (onProgress) onProgress(30);
    const base64Url = await fileToBase64AndCompress(file, fallbackMaxDim);
    if (onProgress) onProgress(100);
    return base64Url;
  }
}
