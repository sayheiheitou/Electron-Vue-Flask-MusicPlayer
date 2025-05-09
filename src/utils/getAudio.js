export async function loadAudio(electronAPI, index) {
    const musicData = await electronAPI.invoke('read-music-file', index);
    const blob = new Blob([musicData],{ type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    return url;
  }