const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (file, folder = 'ecommerce') => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder,
            resource_type: 'auto'
        });
        return result.secure_url;
    } catch (error) {
        throw new Error('Error uploading to Cloudinary');
    }
};

const deleteFromCloudinary = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        throw new Error('Error deleting from Cloudinary');
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};