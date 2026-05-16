export function getDeviceId(): string {
  let deviceId = localStorage.getItem('device_unique_id');
  
  if (!deviceId) {
    // Generate a new unique ID if not exists
    const fingerprint = [
      navigator.userAgent,
      screen.width,
      screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.language
    ].join('|');
    
    // Simple hash function for the fingerprint
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const random = Math.random().toString(36).substring(2, 10);
    deviceId = `DEV-${Math.abs(hash).toString(36)}-${random}`;
    localStorage.setItem('device_unique_id', deviceId);
  }
  
  return deviceId;
}
