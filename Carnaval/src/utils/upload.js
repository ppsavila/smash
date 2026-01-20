// Photo upload utilities for Firebase Storage

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase.js';

/**
 * Upload profile photo to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - User ID
 * @returns {Promise<string>} Download URL of uploaded image
 */
export async function uploadProfilePhoto(file, userId) {
    if (!file) {
        throw new Error('No file provided');
    }

    // Create a reference to the storage location
    const storageRef = ref(storage, `users/${userId}/profile.jpg`);

    try {
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading profile photo:', error);
        throw new Error('Erro ao fazer upload da foto de perfil');
    }
}

/**
 * Upload ficada photo to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} ficadaId - Ficada ID
 * @returns {Promise<string>} Download URL of uploaded image
 */
export async function uploadFicadaPhoto(file, ficadaId) {
    if (!file) {
        throw new Error('No file provided');
    }

    // Create a reference to the storage location
    const storageRef = ref(storage, `ficadas/${ficadaId}/photo.jpg`);

    try {
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);

        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        return downloadURL;
    } catch (error) {
        console.error('Error uploading ficada photo:', error);
        throw new Error('Erro ao fazer upload da foto');
    }
}

/**
 * Delete photo from Firebase Storage
 * @param {string} photoURL - Full URL of the photo to delete
 */
export async function deletePhoto(photoURL) {
    if (!photoURL) return;

    try {
        // Extract the path from the URL
        const path = photoURL.split('/o/')[1]?.split('?')[0];
        if (!path) return;

        const decodedPath = decodeURIComponent(path);
        const storageRef = ref(storage, decodedPath);

        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting photo:', error);
        // Don't throw - deletion errors shouldn't block other operations
    }
}

/**
 * Convert File to base64 (for preview purposes)
 * @param {File} file - Image file
 * @returns {Promise<string>} Base64 string
 */
export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}
