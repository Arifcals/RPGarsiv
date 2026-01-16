import mongoose, { Schema, model, models } from "mongoose";

export interface ISectionImage {
  url: string;
}

export interface ISectionCallout {
  type: "info" | "warn" | "note";
  title: string;
  text: string;
}

export interface ISection {
  _id?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  images?: ISectionImage[];
  callouts?: ISectionCallout[];
  subsections?: ISection[];
}

export interface IGame {
  _id: mongoose.Types.ObjectId;
  icon?: string;
  imageUrl?: string;
  name: string;
  desc?: string;
  sections: ISection[];
  clickCount: number;
  viewedIPs: Array<{
    ip: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SectionSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  images: [
    {
      url: { type: String, required: true },
    },
  ],
  callouts: [
    {
      type: { type: String, enum: ["info", "warn", "note"] },
      title: String,
      text: String,
    },
  ],
  subsections: {
    type: [Schema.Types.Mixed],
    default: undefined,
  },
});

const GameSchema = new Schema<IGame>({
  icon: {
    type: String,
    required: false,
    default: "🎮",
  },
  imageUrl: {
    type: String,
    required: false,
  },
  name: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: false,
  },
  sections: [SectionSchema],
  clickCount: {
    type: Number,
    default: 0,
  },
  viewedIPs: [
    {
      ip: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

GameSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default models.Game || model<IGame>("Game", GameSchema);
