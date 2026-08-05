import re

with open('src/pages/TaskDetail.tsx', 'r') as f:
    code = f.read()

target = """      if (job.requiredProofs?.includes("screenshot") && proofFile) {
        finalImageUrl = await uploadImageOrFallback(proofFile, 600, (p) =>
          setUploadProgress(p),
        );
      }"""

new_code = """      if (job.requiredProofs?.includes("screenshot") && proofFile) {
        const fileOrBase64 = imagePreview || proofFile;
        finalImageUrl = await uploadImageOrFallback(fileOrBase64, 600, (p) =>
          setUploadProgress(p),
        );
      }"""

if target in code:
    code = code.replace(target, new_code)
    with open('src/pages/TaskDetail.tsx', 'w') as f:
        f.write(code)
    print("Patched successfully")
else:
    print("Target not found")
