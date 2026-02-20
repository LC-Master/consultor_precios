export const isVideo = (fileType: string) => {
    return ['mp4'].includes(fileType.toLowerCase());
};