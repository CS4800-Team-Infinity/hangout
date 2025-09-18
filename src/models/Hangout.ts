import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from 'uuid';

export interface Hangout extends Document {
    _id: string;
    uuid: string;
    title: string;
    description: string;
    host: mongoose.Types.ObjectId;
    date: Date;
    location: {
        address: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    maxParticipants?: number;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    isPublic: boolean;
    createdAt: Date;
}

const HangoutSchema = new Schema<Hangout>({
    uuid: {
        type: String,
        default: uuidv4,
        unique: true,
        required: true
    },
    title: {
        type: String,
        required: [true, 'title is required'],
        trim: true,
        maxlength: [100, 'title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'description is required'],
        maxlength: [1000, 'description cannot exceed 1000 characters']
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'host is required']
    },
    date: {
        type: Date,
        required: [true, 'date is required'],
        validate: {
            validator: function(v: Date) {
                return v > new Date();
            },
            message: 'date must be in the future'
        }
    },
    location: {
        address: {
            type: String,
            required: [true, 'address is required']
        },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    maxParticipants: {
        type: Number,
        min: [1, 'maxParticipants must be at least 1']
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

HangoutSchema.index({ uuid: 1 });
HangoutSchema.index({ host: 1 });
HangoutSchema.index({ status: 1, isPublic: 1 });

export default mongoose.models.Hangout || mongoose.model<Hangout>('Hangout', HangoutSchema);