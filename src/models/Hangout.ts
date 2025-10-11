import mongoose, { Document, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import User from "./User";

export interface Hangout extends Document {
  _id: string;
  uuid: string;
  title: string;
  description: string;
  host: mongoose.Types.ObjectId;
  date: string | Date;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
    address: string;
  };
  imageUrl?: string;
  maxParticipants?: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isPublic: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const HangoutSchema = new Schema<Hangout>(
  {
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      maxlength: [100, "title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "description is required"],
      maxlength: [1000, "description cannot exceed 1000 characters"],
    },
    host: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "host is required"],
    },
    date: {
      type: Date,
      required: [true, "date is required"],
      validate: {
        validator: function (v: Date) {
          return v > new Date();
        },
        message: "date must be in the future",
      },
    },
    // GeoJSON Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        index: "2dsphere", // auto creates geospatial index
      },
      address: {
        type: String,
        required: [true, "address is required"],
      },
    },
    imageUrl: String,
    maxParticipants: {
      type: Number,
      min: [1, "maxParticipants must be at least 1"],
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;

        // Ensure location always has correct structure
        if (
          ret.location &&
          ret.location.type === "Point" &&
          Array.isArray(ret.location.coordinates)
        ) {
          const [lng, lat] = ret.location.coordinates;
          ret.coordinates = { lat, lng };
        }
        return ret;
      },
    },
  }
);

// Indexes
HangoutSchema.index({ uuid: 1 });
HangoutSchema.index({ host: 1 });
HangoutSchema.index({ status: 1, isPublic: 1 });
HangoutSchema.index({ location: "2dsphere" });

// Normalize any legacy coordinate structure before saving
HangoutSchema.pre("save", function (next) {
  const loc: any = this.location;
  if (loc && loc.coordinates && !Array.isArray(loc.coordinates)) {
    const { lat, lng } = loc.coordinates;
    this.location = {
      type: "Point",
      coordinates: [lng, lat],
      address: loc.address,
    } as any;
  }
  next();
});

export default mongoose.models.Hangout ||
  mongoose.model<Hangout>("Hangout", HangoutSchema);
