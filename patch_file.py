import re

with open('src/pages/TaskDetail.tsx', 'r') as f:
    code = f.read()

target = """      if (job.requiredProofs?.includes("screenshot") && proofFile) {
        const fileOrBase64 = imagePreview || proofFile;
        finalImageUrl = await uploadImageOrFallback(fileOrBase64, 600, (p) =>
          setUploadProgress(p),
        );
      }"""

new_code = """      if (job.requiredProofs?.includes("screenshot") && proofFile) {
        const fileOrBase64 = imagePreview || proofFile;
        finalImageUrl = await uploadImageOrFallback(fileOrBase64, 600, (p) =>
          setUploadProgress(p),
        );
      }
      
      let finalFileUrl = genericFileUrl;
      if (job.requiredProofs?.includes("file") && genericFile) {
         finalFileUrl = await uploadFileGeneric(genericFile, (p) => setUploadProgress(p));
      }"""

code = code.replace(target, new_code)

target2 = """      if (job.requiredProofs?.includes("videoUrl")) proofs.videoUrl = videoUrl;"""

new_code2 = """      if (job.requiredProofs?.includes("videoUrl")) proofs.videoUrl = videoUrl;
      if (job.requiredProofs?.includes("file")) proofs.fileUrl = finalFileUrl;"""

code = code.replace(target2, new_code2)

with open('src/pages/TaskDetail.tsx', 'w') as f:
    f.write(code)

