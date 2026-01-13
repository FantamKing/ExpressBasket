const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'vendor', 'normal_viewer', 'special_viewer'],
        default: 'vendor'
    },
    permissions: [{
        type: String,
        enum: [
            // Management permissions
            'manage_products', 'manage_categories', 'manage_orders', 'manage_orders_map',
            'manage_delivery_partners', 'manage_delivery_issues', 'manage_support',
            'manage_users', 'manage_admins', 'manage_admins_passwords', 'manage_admins_roles',
            'manage_memberships', 'manage_wallets', 'manage_tracking', 'manage_mails', 'manage_server',
            // View-only permissions
            'view_everything', 'view_products', 'view_categories', 'view_orders', 'view_orders_map',
            'view_delivery_partners', 'view_delivery_issues', 'view_support', 'view_users',
            'view_admins', 'view_memberships', 'view_wallets', 'view_tracking', 'view_mails', 'view_server',
            // Special permissions
            'view_reports', 'creator'
        ]
    }],
    tags: [{
        type: String
    }],
    profilePicture: {
        type: String,
        default: null
    },
    avatarFrame: {
        type: String,
        enum: ['fire', 'neon', 'galaxy', 'gold', 'electric', 'rainbow', 'ice', 'phantom', 'custom', null],
        default: null
    },
    customFrameUrl: {
        type: String,
        default: null
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }],
    likeBoost: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Face Recognition fields
    faceRecognition: {
        enabled: {
            type: Boolean,
            default: false
        },
        descriptor: {
            type: [Number], // 128-dimension face descriptor array
            default: null
        },
        registeredAt: {
            type: Date,
            default: null
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null
        },
        approvedAt: {
            type: Date,
            default: null
        },
        lastUsed: {
            type: Date,
            default: null
        },
        requestStatus: {
            type: String,
            enum: ['none', 'pending', 'approved', 'rejected'],
            default: 'none'
        },
        requestedAt: {
            type: Date,
            default: null
        },
        rejectionReason: {
            type: String,
            default: null
        }
    },
    // Session token for single-session login
    sessionToken: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);