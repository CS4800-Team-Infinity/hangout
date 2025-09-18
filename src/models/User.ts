import mongoose, { Document, Schema } from "mongoose";

export enum UserRole {
    GUEST = 'guest',
    USER = 'user',
    ADMIN = 'admin'
}

export interface IUser extends Document {
    _id: string;
    email?: string;
    username?: string;
    password?: string;
    name: string;
    role: UserRole;

    // user specific
    friends?: mongoose.Types.ObjectId[];
    profilePicture?: string;
    bio?: string;

    // guest specific
    guestId?: string;
    tempEmail?: string;

    // tracking
    createdAt: Date;
    lastActive: Date;
    isActive: boolean;
}

const UserSchema = new Schema<IUser>({
    email: {
        type: String,
        unique: true,
        sparse: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'please enter a valid email']
    },
    username: {
        type: String,
        unique: true,
        sparse: true,
        minlength: [3, 'username must be at least 3 characters'],
    },
    password: {
        type: String,
        minlength: [6, 'password must be at least 6 characters'],
    },
    name: {
        type: String,
        required: [true, 'name is required'],
        trim: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER
    },

    // user specific
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    profilePicture: String,
    bio: String,

    // guest specific
    guestId: {
        type: String,
        unique: true,
        sparse: true
    },
    tempEmail: String,

    // tracking
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
  timestamps: true
});

UserSchema.index({ email: 1 });
UserSchema.index({ username: 1 });
UserSchema.index({ guestId: 1 });
UserSchema.index({ role: 1, isActive: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);