const dotenv = require("dotenv");
dotenv.config();
// getting-started.js
const mongoose = require("mongoose");
const { DeveloperModel } = require("./schema/developer.mode");
const { ProjectModel } = require("./schema/project.mode");
const { UnitModel } = require("./schema/unit.mode");
const uri = process.env.MONGO_URI;
main().catch((err) => console.log(err));

async function projectLookup() {
  const Developers = await DeveloperModel.find(
    {},
    { _id: 1, name: 1, city: 1 }
  );
  Developers.forEach(async (element) => {
    const res = await ProjectModel.updateMany(
      { supplier: element.name },
      { developer: element._id }
    );
    if (res.modifiedCount > 0) {
      console.log(res);
    }
  });
}

async function unitsLookup() {
  const Projects = await ProjectModel.find(
    {},
    { _id: 1, name: 1, city: 1, developer: 1 }
  );
  Projects.forEach(async (element) => {
    const res = await UnitModel.updateMany(
      { pro: element.name, city: element.city },
      { project: element._id, developer: element.developer }
    );
    if (res.modifiedCount > 0) {
      console.log(res);
    }
  });
}
async function main() {
  await mongoose.connect(uri);
  await unitsLookup();
}
