import jsQR from "jsqr";

/**
 * Scans an image (File object) for a QR code.
 * @param {File} file - The image file to scan.
 * @returns {Promise<string|null>} - The QR code data (URL) or null if not found.
 */
export const scanQRCode = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    console.log("Found QR code", code.data);
                    resolve(code.data);
                } else {
                    console.log("No QR code found");
                    resolve(null);
                }
            };
            img.onerror = () => reject(new Error("Failed to load image for QR scanning"));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
    });
};
