const mongoose = require('./connection');
const Schema = mongoose.Schema;

// Define the ImageSchema
const ImageSchema = new Schema({
    fileUrl: {
        type: String,
        required: true
    },
    fileName: {
        type: String,
        required: true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define the virtual for the thumbnail
ImageSchema.virtual('thumbnail').get(function () {
    return this.fileUrl.replace('/upload', '/upload/w_200');
});

// Define the FolderSchema that contains images
const FolderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    images: [ImageSchema]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define the gallerySchema that contains folders
const gallerySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true

    },
    folders: [FolderSchema]
}, {
    timestamps: true
});

// Create the Gallery model
const Gallery = mongoose.model('Gallery', gallerySchema);
module.exports = Gallery;
