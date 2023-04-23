var XLSX = require("xlsx");
var MongoClient = require("mongodb").MongoClient;

var workbook = XLSX.readFile("AI_26012023.xlsx");
var sheet_name_list = workbook.SheetNames;

const uri = "";
const client = new MongoClient(uri);
const database = client.db("empoweromics");


const LoadProjects = async function (data) {
  return data.map((item  ) => {
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

    return {
      code: item.ID,
      name: item.Name.toLowerCase(),
      supplier: item.Supplier_Name,
      state: item.ProjectStateName
        ? item.ProjectStateName.trim().toLowerCase()
        : null,
      category: item.SupplierCategoryName
        ? item.SupplierCategoryName.trim().toLowerCase()
        : null,
      description: item.Description,
      area: item.AreaName.toLowerCase(),
      city: item.CityName.toLowerCase(),
      country: item.CountryName.toLowerCase(),
      acres: parseFloat(item.acres),
      geoJSON: {
        type: "Polygon",
        coordinates: geoJsonConverted,
      },
      rating: Math.random() * 4.8,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });
   
};


async function run() {
  try {
    let Projects = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
   
    await LoadUnits(Units);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
