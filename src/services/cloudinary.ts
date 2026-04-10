import axios from 'axios';

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/duoxjifia/image/upload`;
const UPLOAD_PRESET = 'ml_default'; 

export const uploadImage = async (imageUri: string) => {
  if (!imageUri) return null;

  const formData = new FormData();
  
  // In React Native, the file object for FormData needs this specific structure
  const fileToUpload = {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any;

  formData.append('file', fileToUpload);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Higher timeout for image uploads
      timeout: 30000,
    });
    
    return response.data.secure_url;
  } catch (error: any) {
    if (error.response) {
      console.error('Cloudinary Detailed Error:', error.response.data);
      // Special check for signed/unsigned error
      if (error.response.data.error?.message?.includes('unsigned')) {
        throw new Error('Cloudinary preset must be set to "Unsigned" in settings.');
      }
    }
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
