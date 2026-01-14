const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema({
    partnerId: {
        type: String,
        unique: true,
        sparse: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedAt: {
        type: Date
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    vehicle: {
        type: {
            type: String,
            enum: ['bike', 'scooter', 'car', 'van'],
            default: 'bike'
        },
        number: String
    },
    // GeoJSON location for geospatial queries
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [77.2090, 28.6139] // Default Delhi coordinates
        }
    },
    // Legacy location format (keep for compatibility)
    currentLocation: {
        lat: Number,
        lng: Number,
        timestamp: Date
    },
    socketId: {
        type: String
    },
    activeOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    currentDelivery: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Delivery'
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to generate unique partnerId
deliveryPartnerSchema.pre('save', async function (next) {
    if (!this.partnerId) {
        // Generate unique ID like "DP-XXXX" where XXXX is random alphanumeric
        const generateId = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let id = 'DP-';
            for (let i = 0; i < 4; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return id;
        };

        // Ensure uniqueness
        let newId = generateId();
        let exists = await this.constructor.findOne({ partnerId: newId });
        while (exists) {
            newId = generateId();
            exists = await this.constructor.findOne({ partnerId: newId });
        }
        this.partnerId = newId;
    }
    next();
});

// Create geospatial index for location-based queries
deliveryPartnerSchema.index({ location: '2dsphere' });

// Create indexes for partner search
deliveryPartnerSchema.index({ 'vehicle.number': 1 });
deliveryPartnerSchema.index({ phone: 1 });
deliveryPartnerSchema.index({ partnerId: 1 });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
