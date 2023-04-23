var XLSX = require("xlsx");
const path = require("path");

const { Datastore } = require("@google-cloud/datastore");

var workbook = XLSX.readFile("AI_26012023.xlsx");
var sheet_name_list = workbook.SheetNames;

const datastore = new Datastore({
  keyFilename: path.join(__dirname, "./serviceAccount.json"),
  projectId: "platform-3-35c05",
  namespace: "empoweromics",
});
async function quickstart() {}

const LoadDevelopers = async function (data) {
  // The kind for the new entity
  const kind = "developers";

  data.map(async (item) => {
    const taskKey = datastore.key([kind, item.developer_name]);
    const res = {
      name: item.developer_name,
      website: item.Website,
      area: item.Area.toLowerCase(),
      city: item.City.toLowerCase(),
      country: item.Country.toLowerCase(),
      description: item.Description ? item.Description.substring(0, 100) : "",
      logo: item.UrltoLogo,
      rating: Math.random() * 4.8,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Prepares the new entity
    const task = {
      key: taskKey,
      data: res,
    };

    // Saves the entity
    await datastore.save(task);
    console.log(`Saved ${task.key.name}: ${task.data.name}`);
  });
};

const LoadProjects = async function (data) {
  // The kind for the new entity
  const kind = "projects";
  data.map(async (item) => {
    const taskKey = datastore.key([kind, item.Name.toLowerCase()]);

    let geoLocate = item.GeoLocation + "";
    let geoLocateArr = geoLocate
      .split("((")
      .join("")
      .split("))")
      .join(" ")
      .split("POLYGON")
      .join(" ")
      .split(", ")
      .join(" ")
      .trim()
      .split(" ");
    let geoJsonConverted = [[]];
    for (let i = 0; i < geoLocateArr.length; i += 2) {
      geoJsonConverted[0].push([
        parseFloat(geoLocateArr[i]),
        parseFloat(geoLocateArr[i + 1]),
      ]);
    }

    const res = {
      code: item.ID,
      name: item.Name.toLowerCase(),
      supplier: item.Supplier_Name,
      state: item.ProjectStateName
        ? item.ProjectStateName.trim().toLowerCase()
        : null,
      category: item.SupplierCategoryName
        ? item.SupplierCategoryName.trim().toLowerCase()
        : null,
      description: item.Description ? item.Description.substring(0, 100) : "",

      area: item.AreaName.toLowerCase(),
      city: item.CityName.toLowerCase(),
      country: item.CountryName.toLowerCase(),
      acres: parseFloat(item.acres),
      // geoJSON: geoJsonConverted,
      rating: Math.random() * 4.8,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // Prepares the new entity
    const task = {
      key: taskKey,
      data: res,
    };

    // Saves the entity
    await datastore.delete(taskKey);
  });
};

 

async function run() {
  try {
    let Projects = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    let Developers = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[1]]
    );
    let Units = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[2]]);

    await LoadProjects(Projects);
  } finally {
    console.log("Finish Running ...");
  }
}
run().catch(console.dir);
