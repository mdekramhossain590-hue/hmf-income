import re

with open('src/pages/TaskDetail.tsx', 'r') as f:
    code = f.read()

# 1. Add genericFileBase64 to state
code = code.replace(
    'const [genericFileUrl, setGenericFileUrl] = useState("");',
    'const [genericFileUrl, setGenericFileUrl] = useState("");\n  const [genericFileBase64, setGenericFileBase64] = useState<string | null>(null);'
)

# 2. Update the handler
target_handler = """      setGenericFile(file);
      setGenericFileUrl("");
      const reader = new FileReader();
      reader.onerror = () => {
        console.error("FileReader error", reader.error);
        setErrorMsg("Failed to read file. Please try again or use a different file.");
        setGenericFile(null);
      };
      reader.onloadend = () => {
        if (reader.result) {
          setGenericFileUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);"""

new_handler = """      setGenericFile(file);
      setGenericFileUrl("");
      const reader = new FileReader();
      reader.onerror = () => {
        console.error("FileReader error", reader.error);
        setErrorMsg("Failed to read file. Please try again or use a different file.");
        setGenericFile(null);
      };
      reader.onloadend = () => {
        if (reader.result) {
          setGenericFileBase64(reader.result as string);
        }
      };
      reader.readAsDataURL(file);"""

code = code.replace(target_handler, new_handler)

# 3. Update confirmSubmit
target_submit = """      let finalFileUrl = genericFileUrl;
      if (job.requiredProofs?.includes("file") && genericFile) {
         finalFileUrl = await uploadFileGeneric(genericFile, (p) => setUploadProgress(p));
      }"""

new_submit = """      let finalFileUrl = genericFileUrl;
      if (job.requiredProofs?.includes("file") && genericFile) {
         const fileToUpload = genericFileBase64 || genericFile;
         finalFileUrl = await uploadFileGeneric(fileToUpload, (p) => setUploadProgress(p));
      }"""

code = code.replace(target_submit, new_submit)

with open('src/pages/TaskDetail.tsx', 'w') as f:
    f.write(code)

print("Patched generic file base64")
