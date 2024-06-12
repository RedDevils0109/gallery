const Gallery = require('../models/gallery');
const User = require('../models/user');
const { cloudinary } = require('../cloudinary')


const addFolder = async (req, res) => {

    const name = req.body.name;
    const userId = req.session.user._id;
    let gallery = await Gallery.findOne({ userId: userId });

    if (!gallery) {
        gallery = new Gallery({ userId: userId });
    }

    const folder = { name: name, images: [] };
    gallery.folders.push(folder);
    await gallery.save();

    res.redirect('/gallery')


};
const deleteFolder = async (req, res) => {
    const userId = req.session.user._id;
    const folderId = req.params.id;

    if (!folderId) {
        return res.status(400).json({ error: 'Folder ID is required' });
    }

    const gallery = await Gallery.findOne({ userId: userId });
    if (!gallery) {
        return res.status(404).json({ error: 'Gallery not found' });
    }

    let deleteFolder = {}
    for (let folder of gallery.folders) {
        if (folder._id.equals(folderId)) {
            folder.images.forEach(async (e) => {
                await cloudinary.uploader.destroy(e.fileName);
            })
            break;
        }
    }

    await gallery.updateOne({ $pull: { folders: { _id: folderId } } })

    await gallery.save();


    res.redirect('/gallery')
}
const getFolder = async (req, res) => {
    const userId = req.session.user._id;
    const folderId = req.params.id;
    if (!folderId) {
        return res.status(400).json({ error: 'Folder ID is required' });
    }

    const gallery = await Gallery.findOne({ userId: userId });
    if (!gallery) {
        return res.status(404).json({ error: 'Gallery not found' });
    }
    for (let folder of gallery.folders) {
        if (folder._id.equals(folderId)) {

            return res.render('pages/folder', { folder })
        }
    }

    return res.status(404).json({ error: 'Folder not found' });


}
const getEditFolder = async (req, res) => {
    const userId = req.session.user._id;
    const folderId = req.params.id;
    if (!folderId) {
        return res.status(400).json({ error: 'Folder ID is required' });
    }

    const gallery = await Gallery.findOne({ userId: userId });
    if (!gallery) {
        return res.status(404).json({ error: 'Gallery not found' });
    }
    for (let folder of gallery.folders) {
        if (folder._id.equals(folderId)) {

            return res.render('pages/editFolder', { folder })
        }
    }

    return res.status(404).json({ error: 'Folder not found' });




}
const putEditFolder = async (req, res) => {

    const userId = req.session.user._id;
    const folderId = req.params.id;

    if (!folderId) {
        return res.status(400).json({ error: 'Folder ID is required' });
    }

    let gallery = await Gallery.findOne({ userId: userId });
    if (!gallery) {
        return res.status(404).json({ error: 'Gallery not found' });
    }

    const images = req.files.map(e => ({
        fileName: e.filename,
        fileUrl: e.path
    }));

    let folderFound = false;
    for (let i = 0; i < gallery.folders.length; i++) {
        let tempFolder = gallery.folders[i];
        if (tempFolder._id.equals(folderId)) {
            let tempImages = tempFolder.images;
            tempImages.push(...images);

            const deleteImages = req.body.deleteImages || [];
            if (deleteImages.length > 0) {
                for (let fileName of deleteImages) {
                    await cloudinary.uploader.destroy(fileName); // Deleting images from Cloudinary
                }
                tempImages = tempImages.filter(e => !deleteImages.includes(e.fileName));
            }

            gallery.folders[i].images = tempImages;
            folderFound = true;
            break;
        }
    }

    if (!folderFound) {
        return res.status(404).json({ error: 'Folder not found' });
    }

    await gallery.save();
    return res.redirect(`/gallery/folder/${folderId}`)

};

module.exports = { addFolder, deleteFolder, getFolder, getEditFolder, putEditFolder }