const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    _id: {
      require: true,
      type: String,
    },
    name: {
      require: true,
      type: String,
    },
    supplier: String,
    developer: {
      type: String,
      ref: "developers",
    },
    state: String,
    category: String,
    area: String,
    city: String,
    country: String,
    acres: Number,
    rating: Number,
    polygonHasNull: Boolean,
    active: {
      type: Boolean,
      default: true,
    },
    i18n: {
      type: Object,
    },
    geoJSON: {
      type: String,
      coordinates: {
        type: [Number],
        required: false,
      },
    },
  },
  { timestamps: true }
);

exports.ProjectModel = mongoose.model("project", projectSchema);
