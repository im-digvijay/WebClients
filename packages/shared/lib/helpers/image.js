import { REGEX_IMAGE_EXTENSION } from '../constants';
import { toBase64 } from './file';

/**
 * Convert base64 string to Image
 * @param  {String} base64str
 * @return {Object}
 */
export const toImage = (base64str) => {
    return new Promise((resolve) => {
        const image = new Image();

        image.onload = () => {
            resolve(image);
        };

        image.src = base64str;
    });
};

/**
 * Resizes a picture to a maximum height/width (preserving height/width ratio)
 * @param {String} original Base64 representation of image to be resized.
 * @param {Number} maxWidth Maximum amount of pixels for the width of the resized image.
 * @param {Number} maxHeight Maximum amount of pixels for the height of the resized image
 * @param {String} finalMimeType Mime type of the resulting resized image.
 * @param {Number} encoderOptions A Number between 0 and 1 indicating image quality if the requested type is image/jpeg or image/webp
 * @return {Promise} receives base64 string of resized image.
 *
 * @dev If maxWidth or maxHeight are equal to zero, the corresponding dimension is ignored
 */
export const resizeImage = (
    original,
    maxWidth = 0,
    maxHeight = 0,
    finalMimeType = 'image/jpeg',
    encoderOptions = 1
) => {
    return toImage(original).then((image) => {
        // Resize the image
        const canvas = document.createElement('canvas');
        let { width, height } = image;

        const [widthRatio, heightRatio] = [maxWidth && width / maxWidth, maxHeight && height / maxHeight].map(Number);

        if (widthRatio >= heightRatio && widthRatio > 1) {
            height /= widthRatio;
            width = maxWidth;
        } else if (heightRatio > 1) {
            width /= heightRatio;
            height = maxHeight;
        } else {
            return image.src;
        }

        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image, 0, 0, width, height);

        return canvas.toDataURL(finalMimeType, encoderOptions);
    });
};

/**
 * Extract the mime and base64 str from a base64 image.
 * @param {String} str
 * @returns {Promise} {mime, base64}
 */
const extractBase64Image = (str = '') => {
    const [mimeInfo = '', base64 = ''] = (str || '').split(',');
    const [, mime = ''] = mimeInfo.match(/:(.*?);/) || [];
    return { mime, base64 };
};

/**
 * Convert a base 64 str to an uint8 array.
 * @param base64str
 * @returns {Uint8Array}
 */
const toUint8Array = (base64str) => {
    const bstr = atob(base64str);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return u8arr;
};

/**
 * Convert a data URL to a Blob Object
 * @param {String} base64str
 * @param {String} filename
 * @return {Object}
 */
export const toFile = (base64str, filename = 'file') => {
    const { base64, mime } = extractBase64Image(base64str);
    return new File([toUint8Array(base64)], filename, { type: mime });
};

/**
 * Convert a data URL to a Blob Object
 * @param  {String} base64str
 * @return {Blob}
 */
export const toBlob = (base64str) => {
    const { base64, mime } = extractBase64Image(base64str);
    return new Blob([toUint8Array(base64)], { type: mime });
};

/**
 * Down size image to reach the max size limit
 * @param  {String} base64str
 * @param  {Number} maxSize in bytes
 * @param  {String} mimeType
 * @param  {Number} encoderOptions
 * @return {Promise}
 */
export const downSize = (base64str, maxSize, mimeType = 'image/jpeg', encoderOptions = 1) => {
    const process = (source, maxWidth, maxHeight) => {
        return resizeImage(source, maxWidth, maxHeight, mimeType, encoderOptions).then((resized) => {
            const { size } = new Blob([resized]);

            if (size <= maxSize) {
                return resized;
            }

            return process(resized, Math.round(maxWidth * 0.9), Math.round(maxHeight * 0.9));
        });
    };

    return toImage(base64str).then(({ height, width }) => process(base64str, width, height));
};

/**
 * Returns true if the URL is an inline embedded image.
 * @param {String} src
 * @returns {boolean}
 */
export const isInlineEmbedded = (src = '') => src.startsWith('data:');

/**
 * Returns true if the URL is an embedded image.
 * @param {String} src
 * @returns {boolean}
 */
export const isEmbedded = (src = '') => src.startsWith('cid:');

/**
 * Resize image file
 * @param {File} fileImage
 * @param {Number} maxSize in bytes
 * @returns {Promise<String>} Base64
 */
export const resize = async (fileImage, maxSize) => {
    const base64str = await toBase64(fileImage);
    return downSize(base64str, maxSize, fileImage.type);
};

/**
 * Prepare image source to be display
 * @param {String} value
 * @return {String}
 */
export const formatImage = (value = '') => {
    if (!value) {
        return value;
    }

    if (REGEX_IMAGE_EXTENSION.test(value)) {
        return value;
    }

    if (value.startsWith('data:')) {
        return value;
    }

    return `data:image/png;base64,${value}`;
};
