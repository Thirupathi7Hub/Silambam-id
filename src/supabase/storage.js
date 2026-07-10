// Supabase Storage — replaces src/firebase/storage.js
// Profile photos stored in Supabase Storage (free: 1GB)
import { supabase } from './config';

const BUCKET = 'member-photos'; // create this bucket in Supabase dashboard

/**
 * Compress an image file before uploading
 */
export const compressImage = (file, maxWidth = 400, quality = 0.85) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width  = img.width  * (ratio < 1 ? ratio : 1);
        canvas.height = img.height * (ratio < 1 ? ratio : 1);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
    };
  });
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

    // Compress image first
    const compressed = await compressImage(file, 300, 0.8);
    if (onProgress) onProgress(30);

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
    const compressed = await compressImage(file, 300, 0.8);
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

// ── Internal helper ──
const _toBase64 = (blob, onProgress) =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result);
    };
  });
