import axios from 'axios';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/duoxjifia/image/upload`;
const UPLOAD_PRESET = 'ml_default'; // You might need to create an unsigned preset in Cloudinary

export const uploadImage = async (imageUri: string) => {
  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('api_key', '275499513353161');

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
