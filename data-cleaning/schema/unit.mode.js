const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema(
  {
    _id: {
      require: true,
      type: String,
    },
    category: {
      require: true,
      type: String,
    },
    type: {
      require: true,
      type: String,
    },
    finishingType: String,
    developer: String,
    project: String,

    dev: String,
    pro: String,

    priceBase: Number,
    spaceBuildUp: Number,
    pricePerMeter: Number,
    paymentYears: Number,
    estDelivery: {
      type: [Number],
      required: false,
    },
    active: Boolean,
  },
  { timestamps: true }
);

exports.UnitModel = mongoose.model("unit", unitSchema);
