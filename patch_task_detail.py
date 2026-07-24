import re

with open('src/pages/TaskDetail.tsx', 'r') as f:
    text = f.read()

# Add imports
text = text.replace('import { uploadImageOrFallback } from "../lib/imageUpload";', 'import { uploadImageOrFallback, uploadFileGeneric } from "../lib/imageUpload";\nimport { File as FileIcon } from "lucide-react";')

# Add state
state_add = """  const [genericFile, setGenericFile] = useState<File | null>(null);
  const [genericFileUrl, setGenericFileUrl] = useState("");
"""
text = text.replace('  const [proofImage, setProofImage] = useState(""); // Stores URL if pasted', state_add + '  const [proofImage, setProofImage] = useState(""); // Stores URL if pasted')

# Add handleGenericFileChange
func_add = """
  const handleGenericFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("File must be smaller than 5MB.");
        return;
      }
      setErrorMsg(null);
      setGenericFile(file);
      setGenericFileUrl("");
    }
  };
  
  const removeGenericFile = () => {
    setGenericFile(null);
  };
"""
text = text.replace('  const removeImage = () => {', func_add + '\n  const removeImage = () => {')

# Add submission logic
sub_logic = """
      if (job.requiredProofs?.includes("screenshot") && !proofFile && !proofImage) {
        toast.error("Please provide a screenshot or image link.");
        return;
      }
      if (job.requiredProofs?.includes("file") && !genericFile && !genericFileUrl) {
        toast.error("Please provide the required file or link.");
        return;
      }
"""
text = re.sub(r'      if \(job\.requiredProofs\?\.includes\("screenshot"\) && !proofFile && !proofImage\) \{.*?(?=      if \(job\.requiredProofs\?\.includes\("username"\))', sub_logic, text, flags=re.DOTALL)

# Add upload logic
up_logic = """
      let uploadedScreenshot = proofImage;
      if (proofFile) {
        uploadedScreenshot = await uploadImageOrFallback(proofFile, 800, (p) => {
          setUploadProgress(p * 0.5); // Allocate 50% for image
        });
      }

      let uploadedGenericFile = genericFileUrl;
      if (genericFile) {
        uploadedGenericFile = await uploadFileGeneric(genericFile, (p) => {
          setUploadProgress(50 + p * 0.5); // Allocate other 50% for generic file
        });
      }
"""
text = re.sub(r'      let uploadedScreenshot = proofImage;\n      if \(proofFile\) \{.*?\}\n', up_logic, text, flags=re.DOTALL)

# Add to proofs object
proofs_obj = """
        text: job.requiredProofs?.includes("text") ? proofText : null,
        screenshot: job.requiredProofs?.includes("screenshot") ? uploadedScreenshot : null,
        fileUrl: job.requiredProofs?.includes("file") ? uploadedGenericFile : null,
"""
text = re.sub(r'        text: job\.requiredProofs\?\.includes\("text"\) \? proofText : null,\n        screenshot: job\.requiredProofs\?\.includes\("screenshot"\) \? uploadedScreenshot : null,\n', proofs_obj, text)

with open('src/pages/TaskDetail.tsx', 'w') as f:
    f.write(text)
