import sys

with open('temp.txt', 'r') as f:
    content = f.read()

# The string that was inserted before each character
delimiter = """    const fetchSiteSettings = async () => {
      try {
        const snap = await getCachedDoc(doc(db, "settings", "site"), true);
        if (snap.exists()) {
          const data = snap.data() as SiteSettings;
          if (!data.apkUrl) {
            data.apkUrl = 'https://www.mediafire.com/file/glio303il0rsfr4/app-release.apk/file';
          }
          if (data.adsViewEnabled === undefined) {
              data.adsViewEnabled = false;
          } else {
              data.adsViewEnabled = !!data.adsViewEnabled;
          }
          setSiteSettings(data);
          try {
            localStorage.setItem('siteSettings', safeStringify(data));
          } catch(e) {}
          if (data.logoUrl) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.head.appendChild(link);
            }
            link.href = data.logoUrl;
          }
        }
      } catch (e: any) {
        if (detectQuotaError(e)) {
          setIsQuotaExceeded(true);
          console.warn("Firestore Quota exceeded. Site may not function properly until reset.");
        } else {
          console.warn("Error fetching site settings:", e.message || "Unknown Error");
        }
      }
    };"""

# split by delimiter
parts = content.split(delimiter)

original_chars = []
for p in parts:
    if p:
        original_chars.append(p)

original_code = "".join(original_chars)

with open('recovered_Admin.tsx', 'w') as f:
    f.write(original_code)

print("Recovered length:", len(original_code))
