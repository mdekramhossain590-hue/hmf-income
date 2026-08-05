import re

with open('src/lib/imageUpload.ts', 'r') as f:
    code = f.read()

# Replace uploadImageOrFallback signature
code = re.sub(
    r"export async function uploadImageOrFallback\(\n  file: File,",
    "export async function uploadImageOrFallback(\n  file: File | string,",
    code
)

# Replace the fallback block:
target_fallback = """  if (!isConfigured) {
    if (onProgress) onProgress(30);
    const base64Url = await fileToBase64AndCompress(file, fallbackMaxDim);
    if (onProgress) onProgress(100);
    return base64Url;
  }"""

new_fallback = """  if (!isConfigured) {
    if (onProgress) onProgress(30);
    const base64Url = typeof file === 'string' ? file : await fileToBase64AndCompress(file, fallbackMaxDim);
    if (onProgress) onProgress(100);
    return base64Url;
  }"""
code = code.replace(target_fallback, new_fallback)

# Replace the try block for formData
target_formData = """    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);"""

new_formData = """    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);"""
# wait, if it's a string, we can still append it. But formData expects a Blob or string. A base64 string works for Cloudinary!

target_catch = """    console.warn("Cloudinary upload failed, falling back to base64:", error);
    if (onProgress) onProgress(30);
    const base64Url = await fileToBase64AndCompress(file, fallbackMaxDim);
    if (onProgress) onProgress(100);
    return base64Url;"""

new_catch = """    console.warn("Cloudinary upload failed, falling back to base64:", error);
    if (onProgress) onProgress(30);
    const base64Url = typeof file === 'string' ? file : await fileToBase64AndCompress(file, fallbackMaxDim);
    if (onProgress) onProgress(100);
    return base64Url;"""
code = code.replace(target_catch, new_catch)

# Also fix uploadFileGeneric
code = re.sub(
    r"export async function uploadFileGeneric\(\n  file: File,",
    "export async function uploadFileGeneric(\n  file: File | string,",
    code
)

target_generic_fallback = """    // Base64 fallback for generic files (limited size)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error("File read failed"));
    });"""

new_generic_fallback = """    if (typeof file === 'string') {
      if (onProgress) onProgress(100);
      return file;
    }
    // Base64 fallback for generic files (limited size)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error("File read failed"));
    });"""
code = code.replace(target_generic_fallback, new_generic_fallback)

target_generic_catch = """    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error("File read failed"));
    });"""

new_generic_catch = """    if (typeof file === 'string') {
      if (onProgress) onProgress(100);
      return file;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(new Error("File read failed"));
    });"""
code = code.replace(target_generic_catch, new_generic_catch)

with open('src/lib/imageUpload.ts', 'w') as f:
    f.write(code)
print("PATCHED")
