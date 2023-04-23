const mongoose = require("mongoose");

const developerSchema = new mongoose.Schema(
  {
    _id: {
      require: true,
      type: String,
    },
    name: {
      require: true,
      type: String,
    },
    website: String,
    area: String,
    city: String,
    country: String,
    logo: String,
    rating: Number,
    active: Boolean,
    i18n: {
      type: Object,
    },
  },
  { timestamps: true }
);

exports.DeveloperModel = mongoose.model("developer", developerSchema);
