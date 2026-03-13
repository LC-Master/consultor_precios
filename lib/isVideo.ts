export const isVideo = (fileType: string) => {
    const normalized = fileType.replace('.', '').trim().toLowerCase();
    return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].some(ext => normalized.includes(ext));
};