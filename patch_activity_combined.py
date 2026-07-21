import re

with open('src/pages/ActivityHistory.tsx', 'r') as f:
    code = f.read()

target = """        const combined = [
          ...txItems.map((t) => {
            const d = t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt ? new Date(t.createdAt) : new Date(0);
            return { ...t, date: d, _originalType: t.type };
          }),
          ...subItems.map((t) => {
            const timeField = t.submittedAt || t.completedAt;
            const d = timeField?.toDate ? timeField.toDate() : timeField ? new Date(timeField) : new Date(0);
            return { ...t, date: d, _originalType: t.type };
          }),
        ];"""

replacement = """        const combined = [
          ...txItems.map((t) => {
            const d = t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt ? new Date(t.createdAt) : new Date(0);
            return { ...t, date: d, _originalType: t.type };
          }),
          ...subItems.map((t) => {
            const timeField = t.submittedAt || t.completedAt;
            const d = timeField?.toDate ? timeField.toDate() : timeField ? new Date(timeField) : new Date(0);
            return { ...t, date: d, _originalType: t.type };
          }),
          ...refItems.map((t) => {
            const d = t.createdAt?.toDate ? t.createdAt.toDate() : t.createdAt ? new Date(t.createdAt) : new Date(0);
            return { ...t, date: d, _originalType: t.type };
          }),
        ];"""

code = code.replace(target, replacement)

with open('src/pages/ActivityHistory.tsx', 'w') as f:
    f.write(code)

