import mongoose, { Schema, Document } from 'mongoose';

export interface RSVP extends Document {
    hangout: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'declined';
    respondedAt?: Date;
    notes?: string;
}

const RSVPSchema = new Schema<RSVP>({
    hangout: {
        type: Schema.Types.ObjectId,
        ref: 'Hangout',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined'],
        default: 'pending'
    },
    respondedAt: Date,
    notes: {
        type: String,
        maxlength: [500, 'notes cannot exceed 500 characters']
    }
}, { timestamps: true });

RSVPSchema.index({ hangout: 1, user: 1 }, { unique: true });

export default mongoose.models.RSVP || mongoose.model<RSVP>('RSVP', RSVPSchema);