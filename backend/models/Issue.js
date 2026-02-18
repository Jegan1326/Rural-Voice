const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        enum: ['Water', 'Roads', 'Electricity', 'Sanitation', 'Agriculture', 'Public Safety', 'Other'],
        required: true,
    },
    imageUrl: {
        type: String,
    },
    audioUrl: {
        type: String,
    },
    location: {
        lat: Number,
        lng: Number,
    },
    status: {
        type: String,
        enum: ['Submitted', 'Under Review', 'In Progress', 'Resolved'],
        default: 'Submitted',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    votes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    village: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Village', // Semantically represents Taluk now
        required: true,
    },
    villageName: {
        type: String,
        required: true,
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now,
        },
        replies: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            createdAt: { type: Date, default: Date.now }
        }]
    }],
    resolvedAt: {
        type: Date,
    },
    progressUpdates: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
        },
        recordedAt: {
            type: Date,
            default: Date.now,
        }
    }],
}, {
    timestamps: true,
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
