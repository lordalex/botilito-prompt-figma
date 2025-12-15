// src/utils/imageUtils.ts

const MAX_FILE_SIZE_MB = 2;
const MAX_DIMENSION = 1024;

export const resizeAndEncodeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context.'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL(file.type, 0.9); // Use file.type and quality 0.9

        // Check file size (in bytes)
        const base64Data = dataUrl.split(',')[1];
        const fileSize = (base64Data.length * 3) / 4 - (base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0);

        if (fileSize > MAX_FILE_SIZE_MB * 1024 * 1024) {
          return reject(new Error(`Image is too large after resizing. Max size is ${MAX_FILE_SIZE_MB}MB.`));
        }

        resolve(dataUrl);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image.'));
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    reader.readAsDataURL(file);
  });
};
