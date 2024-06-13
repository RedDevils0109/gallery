const Joi = require('joi');

const addFolderSchema = Joi.object({
    name: Joi.string().required()
});

const editFolderSchema = Joi.object({
    deleteImages: Joi.array().items(Joi.string())

});

// Validation function
const validateAddFolder = (req, res, next) => {
    const { error } = addFolderSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details.map(detail => detail.message) });
    }
    next();
};

const validateEditFolder = (req, res, next) => {
    const { error } = editFolderSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details.map(detail => detail.message) });
    }
    next();
};

module.exports = {
    validateAddFolder,
    validateEditFolder
};
