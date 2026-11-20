// Shrinks big phone photos before upload: longest side 1600px, JPEG. Falls back to the original file.
export async function resizeImage(file: File, maxSide = 1600, quality = 0.84): Promise<File> {
  try {
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) return file;
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 1_500_000) { bmp.close(); return file; }
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    bmp.close();
    const blob: Blob | null = await new Promise((r) => c.toBlob(r, "image/jpeg", quality));
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" }) : file;
  } catch { return file; }
}
