import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads an image to Firebase Storage
 * @param file - The image file to upload
 * @param userId - The user ID for organizing files
 * @param type - The type of image ('profile' or 'cover')
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  userId: string,
  type: 'profile' | 'cover'
): Promise<string> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${userId}_${type}_${timestamp}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `merchants/${userId}/${filename}`);

    // Upload the file
    await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Deletes an image from Firebase Storage
 * @param imageUrl - The URL of the image to delete
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);

    if (!pathMatch) {
      throw new Error('Invalid image URL');
    }

    const path = decodeURIComponent(pathMatch[1]);
    const imageRef = ref(storage, path);

    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw error if image doesn't exist
    if (error instanceof Error && !error.message.includes('not found')) {
      throw error;
    }
  }
}

/**
 * Validates image file before upload
 * @param file - The file to validate
 * @returns Error message if invalid, null if valid
 */
export function validateImageFile(file: File): string | null {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return 'Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.';
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return 'File size too large. Maximum size is 5MB.';
  }

  return null;
}
