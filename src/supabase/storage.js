// Supabase Storage — replaces src/firebase/storage.js
// Profile photos stored in Supabase Storage (free: 1GB)
import { supabase } from './config';

const BUCKET = 'member-photos'; // create this bucket in Supabase dashboard

const MAX_SIZE_BYTES = 200 * 1024; // 200 KB hard limit

/**
 * Compress image to a canvas blob at given quality
 */
const _compressToBlob = (img, maxWidth, quality) =>
  new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
    canvas.width  = Math.round(img.width  * ratio);
    canvas.height = Math.round(img.height * ratio);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });

/**
 * Load a File/Blob into an HTMLImageElement
 */
const _loadImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload  = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload  = () => resolve(img);
      img.onerror = reject;
    };
    reader.onerror = reject;
  });

/**
 * Compress an image file, iteratively reducing quality until <= 200 KB.
 * @param {File} file       - Original image file
 * @param {number} maxWidth - Max dimension in px (default 600 for passport photos)
 * @returns {Promise<Blob>} - Compressed JPEG blob under 200 KB
 */
export const compressImage = async (file, maxWidth = 600) => {
  const img = await _loadImage(file);

  // Start at quality 0.85, step down until under limit
  let quality = 0.85;
  let blob = await _compressToBlob(img, maxWidth, quality);

  while (blob.size > MAX_SIZE_BYTES && quality > 0.1) {
    quality = Math.round((quality - 0.05) * 100) / 100;
    blob = await _compressToBlob(img, maxWidth, quality);
  }

  // If still too large at lowest quality, shrink dimensions too
  if (blob.size > MAX_SIZE_BYTES) {
    let shrinkWidth = maxWidth;
    while (blob.size > MAX_SIZE_BYTES && shrinkWidth > 100) {
      shrinkWidth = Math.round(shrinkWidth * 0.8);
      blob = await _compressToBlob(img, shrinkWidth, 0.7);
    }
  }

  console.info(
    `Photo compressed: ${(file.size / 1024).toFixed(1)} KB -> ${(blob.size / 1024).toFixed(1)} KB (quality: ${quality})`
  );
  return blob;
};

/**
 * Upload member profile photo to Supabase Storage
 * @param {File} file - Image file
 * @param {string} uid - User UID
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} Public URL of uploaded photo
 */
export const uploadMemberPhoto = async (file, uid, onProgress) => {
  try {
    if (onProgress) onProgress(10);

    // Compress to under 200 KB before uploading
    const compressed = await compressImage(file, 600);
    if (onProgress) onProgress(35);

    const filePath = `members/${uid}/profile.jpg`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, compressed, {
        contentType: 'image/jpeg',
        upsert: true, // overwrite if exists
      });

    if (uploadError) {
      console.warn('Supabase Storage upload failed. Falling back to Base64.', uploadError.message);
      return await _toBase64(compressed, onProgress);
    }

    if (onProgress) onProgress(90);

    // Get public URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    if (onProgress) onProgress(100);

    // Append cache-buster so UI refreshes on re-upload
    return data.publicUrl + `?t=${Date.now()}`;

  } catch (err) {
    console.warn('uploadMemberPhoto error. Falling back to Base64.', err.message);
    const compressed = await compressImage(file, 600);
    return await _toBase64(compressed, onProgress);
  }
};

/**
 * Delete member photo from Supabase Storage
 */
export const deleteMemberPhoto = async (uid) => {
  try {
    await supabase.storage.from(BUCKET).remove([`members/${uid}/profile.jpg`]);
  } catch {
    // ignore if not found
  }
};

// -- Internal helper --
const _toBase64 = (blob, onProgress) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result);
    };
  });
