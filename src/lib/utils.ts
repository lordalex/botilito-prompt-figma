/**
 * @file src/lib/utils.ts
 * @description Utility functions for the application.
 */

/**
 * Generates a SHA-256 hash of a given string.
 * This is used to create a unique fingerprint for submitted content to avoid re-analyzing
 * the same text or URL.
 * @param {string} content - The string content to hash.
 * @returns {Promise<string>} A promise that resolves to the hex string of the hash.
 */
export async function generateContentHash(content: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } else {
    // Fallback for non-browser or insecure environments (less secure)
    console.warn("SubtleCrypto not available. Using a simple fallback for hashing.");
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
}

/**
 * Converts a File object to a Base64 string.
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves to the Base64 string.
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
