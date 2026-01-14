const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner'
    },
    pickupLocation: {
        address: {
            type: String,
            default: 'Express Basket Warehouse, Delhi'
        },
        coordinates: {
            lat: {
                type: Number,
                default: 28.6139
            },
            lng: {
                type: Number,
                default: 77.2090
            }
        }
    },
    deliveryLocation: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    status: {
        type: String,
        enum: ['pending_broadcast', 'pending_acceptance', 'accepted', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'rejected', 'cancellation_requested'],
        default: 'pending_acceptance'
    },
    // Assignment type: 'direct' (admin assigns specific partner) or 'broadcast' (first-come-first-served)
    assignmentType: {
        type: String,
        enum: ['direct', 'broadcast'],
        default: 'direct'
    },
    otp: {
        type: String,
        required: true
    },
    route: [{
        lat: Number,
        lng: Number,
        timestamp: Date
    }],
    estimatedTime: {
        type: Number // in minutes
    },
    actualTime: {
        type: Number // in minutes
    },
    distance: {
        type: Number // in kilometers
    },
    assignedAt: {
        type: Date,
        default: Date.now
    },
    broadcastedAt: Date,  // When order was broadcasted to all partners
    acceptedAt: Date,     // When partner accepted the order
    rejectedAt: Date,     // When partner rejected the order
    rejectionReason: String,
    inTransitAt: Date,    // When partner started delivery
    pickedUpAt: Date,
    deliveredAt: Date,
    notes: String,
    // Earnings tracking
    earnings: {
        type: Number,
        default: 0
    },
    earningsStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    cancellationReason: String,
    cancelledAt: Date,
    cancelledBy: String
});

// Index for faster queries
deliverySchema.index({ order: 1 });
deliverySchema.index({ deliveryPartner: 1 });
deliverySchema.index({ status: 1 });

module.exports = mongoose.model('Delivery', deliverySchema);
