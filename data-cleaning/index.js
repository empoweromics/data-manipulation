var XLSX = require("xlsx");
var MongoClient = require("mongodb").MongoClient;
const dotenv = require("dotenv");
dotenv.config();

var workbook = XLSX.readFile("AI_26012023.xlsx");
var sheet_name_list = workbook.SheetNames;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const database = client.db("v1");

function convertPolygon(str) {
  str + "";
  let geoLocateArr = str
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
  let polygonHasNull = false;
  for (let i = 0; i < geoLocateArr.length; i += 2) {
    if (!geoLocateArr[i] || !geoLocateArr[i + 1]) polygonHasNull = true;
    geoJsonConverted[0].push([
      parseFloat(geoLocateArr[i]),
      parseFloat(geoLocateArr[i + 1]),
    ]);
  }
  return [geoJsonConverted, polygonHasNull];
}
const LoadDevelopers = async function (data) {
  const dev = data.map((item) => {
    let name = item.developer_name.toLowerCase();
    let description = item.Description;
    return {
      _id: "d-" + (Math.random() + 1).toString(36).substring(3),
      name,
      website: item.Website,
      area: item.Area.toLowerCase(),
      city: item.City.toLowerCase(),
      country: item.Country.toLowerCase(),
      description,
      logo: item.UrltoLogo,
      rating: (Math.random() * 100) / 50 + 3,
      active: true,
      i18n: {
        en: {
          name,
          description,
        },
        ar: {
          name: "",
          description: "",
        },
      },
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
  const _developers = database.collection("developers");
  // create a document to insert
  // this option prevents additional documents from being inserted if one fails
  const options = { ordered: true };
  const result = await _developers.insertMany(dev, options);
  console.log(`A document was inserted with the _id: `);
  console.table(result.insertedIds);
};

const LoadProjects = async function (data) {
  const pro = data.map((item) => {
    let polygonHasNull = true;
    let geoJsonConverted = {};

    if (item.GeoLocation) {
      [geoJsonConverted, polygonHasNull] = convertPolygon(item.GeoLocation);
    }
    let name = item.Name.toLowerCase();
    let description = item.Description;
    return {
      _id: "p-" + item.ID,
      name,
      polygonHasNull,
      supplier: item.Supplier_Name.toLowerCase(),
      state: item.ProjectStateName
        ? item.ProjectStateName.trim().toLowerCase()
        : null,
      category: item.SupplierCategoryName
        ? item.SupplierCategoryName.trim().toLowerCase()
        : null,
      area: item.AreaName.toLowerCase(),
      city: item.CityName.toLowerCase(),
      country: item.CountryName.toLowerCase(),
      acres: parseFloat(item.acres),
      geoJSON: {
        type: "Polygon",
        coordinates: geoJsonConverted,
      },
      i18n: {
        en: {
          name,
          description,
        },
        ar: {
          name: "",
          description: "",
        },
      },
      rating: (Math.random() * 100) / 50 + 3,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
  const _projects = database.collection("projects");
  // create a document to insert
  // this option prevents additional documents from being inserted if one fails
  const options = { ordered: true };

  //console.log(pro[0]);
  const result = await _projects.insertMany(pro, options);
  console.log(`A document was inserted with the _id: `);
  // console.table(result.insertedIds);
};

function estDelivery(str) {
  if (str) {
    let arr = str.split(",");
    arr.map((item) => item.trim());
    return arr.map((item, index) => {
      return parseFloat(item);
    });
  } else {
    return [];
  }
}
const LoadUnits = async function (data) {
  const units = data.map((item) => {
    return {
      _id: "u-" + item.Id,
      category: item.Property_Category.trim().toLowerCase(),
      type: item.Property_Type.trim().replaceAll(" ", "-").toLowerCase(),
      finishingType: item.Property_Finishing_Type.trim()
        .replaceAll(" ", "-")
        .toLowerCase(),
      priceBase: parseFloat(item.PriceBase),
      spaceBuildUp: parseFloat(item.SpaceBuildUp),
      pricePerMeter: parseFloat(item.PricePerMeter),
      paymentYears: parseFloat(item.Payment_Years),
      estDelivery: estDelivery(item.EstDelivery),
      city: item.Project_City.toLowerCase(),
      // country: item.Project_Country.toLowerCase(),
      // area: item.Project_Area.toLowerCase(),
      dev: item.Developer.toLowerCase(),
      pro: item.Project_Name.toLowerCase(),
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
  const _units = database.collection("units");
  // create a document to insert
  // this option prevents additional documents from being inserted if one fails
  //console.log(units[0]);
  const options = { ordered: true };
  const result = await _units.insertMany(units, options);
  console.log(`A document was inserted with the _id: `);
  console.table(result.insertedIds);
};

async function run() {
  try {
    // let Projects = XLSX.utils.sheet_to_json(
    //   workbook.Sheets[sheet_name_list[0]]
    // );
    // let Developers = XLSX.utils.sheet_to_json(
    //   workbook.Sheets[sheet_name_list[1]]
    // );
    let Units = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[2]]);

    await LoadUnits(Units);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

/**
 *
  db.units.updateMany(
   {  },
   { $unset: { created_at: "" , updated_at : "" } }
)
 */
