import re

with open('src/lib/imageUpload.ts', 'r') as f:
    text = f.read()

new_func = """
export async function uploadFileGeneric(
  file: File,
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
    // Base64 fallback for generic files (limited size)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error("File read failed"));
    });
  }

  try {
    if (onProgress) onProgress(20);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    if (onProgress) onProgress(50);
    
    // Use raw/auto upload for non-images
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (onProgress) onProgress(80);
    
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || "Failed to upload file to Cloudinary");
    }
    
    const data = await res.json();
    if (onProgress) onProgress(100);
    return data.secure_url;
  } catch (error) {
    console.warn("Cloudinary file upload failed, falling back to base64:", error);
    if (onProgress) onProgress(30);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error("File read failed"));
    });
  }
}
"""

with open('src/lib/imageUpload.ts', 'a') as f:
    f.write(new_func)
