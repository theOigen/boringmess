const mongoose = require('mongoose');

const AttachmentSchema = mongoose.Schema({
    mediaUrl: { type: String, required: true },
    fileType: { type: String, required: true },
});

const AttachmentModel = mongoose.model('Attachment', AttachmentSchema);

const regexUrl = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)((\/\w+)*\/)([\w\-\.]+[^#?\s]+)(.*)?(#[\w\-]+)?$/;
class Attachment {
    constructor(url, type) {
        this.mediaUrl = url;
        this.fileType = type;
    }

    static getAll() {
        return AttachmentModel.find({});
    }

    static getById(id) {
        return AttachmentModel.findById(id);
    }

    static insert(attachment) {
        if (!this.validateAttachment(attachment)) {
            return Promise.reject(new Error('Attachment object failed validation'));
        } else {
            return new AttachmentModel(attachment).save()
                .then(file => file._id);
        }
    }

    static update(id, attachment) {
        if (!this.validateAttachment(attachment)) {
            return Promise.reject(new Error('Attachment object failed validation'));
        } else {
            return AttachmentModel.updateOne({ _id: id }, attachment);
        }
    }

    static delete(id) {
        return AttachmentModel.deleteOne({ _id: id });
    }

    static validType(type) {
        return type.length >= 0
            && (type === 'image'
                || type === 'video'
                || type === 'audio'
                || type === 'raw');
    }

    static validateAttachment(a) {
        return a && a.mediaUrl !== undefined && a.fileType !== undefined
            && regexUrl.test(a.mediaUrl) && this.validType(a.fileType);
    }
}

module.exports = Attachment;
