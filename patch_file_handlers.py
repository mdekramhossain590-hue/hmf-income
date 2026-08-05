import re

with open('src/pages/TaskDetail.tsx', 'r') as f:
    code = f.read()

target1 = """      const reader = new FileReader();
      reader.onerror = () => { console.error("FileReader error", reader.error); };
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);"""

new1 = """      const reader = new FileReader();
      reader.onerror = () => { 
        console.error("FileReader error", reader.error); 
        setErrorMsg("Failed to read image file. Please try again or use a different file.");
        setProofFile(null);
      };
      reader.onloadend = () => {
        if (reader.result) {
           setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);"""

code = code.replace(target1, new1)

target2 = """      setErrorMsg(null);
      setGenericFile(file);
      setGenericFileUrl("");"""

new2 = """      setErrorMsg(null);
      setGenericFile(file);
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

code = code.replace(target2, new2)

with open('src/pages/TaskDetail.tsx', 'w') as f:
    f.write(code)

print("Patched handlers")
