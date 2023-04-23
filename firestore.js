var XLSX = require("xlsx");
const path = require("path");

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue ,GeoPoint } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

var workbook = XLSX.readFile("AI_26012023.xlsx");
var sheet_name_list = workbook.SheetNames;

 

const LoadDevelopers = async function (data) {
   
  data.map(async (item) => {

     const res = {
      name: item.developer_name,
      website: item.Website ? item.Website : "",
      area: item.Area.toLowerCase(),
      city: item.City.toLowerCase(),
      country: item.Country.toLowerCase(),
      description: item.Description ? item.Description.substring(0, 100) : "",
      logo: item.UrltoLogo ? item.UrltoLogo : "",
      rating: Math.random() * 4.8,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
      // Add a new document with a generated id.
     const insert = await db.collection('developers').add(res);
     console.log('Added document with ID: ', insert.id);
  });
};

const LoadProjects = async function (data) {
  // The kind for the new entity
   data.map(async (item) => {
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
    let myPolygon = [];
    for (let i = 0; i < geoLocateArr.length; i += 2) {
      let lat = parseFloat(geoLocateArr[i]);
      let lng = parseFloat(geoLocateArr[i+1]);
      if(lat && lng) {
        // console.log(lat , lng)
        let point = new GeoPoint(lat ,  lng)
        myPolygon.push(point);
      }
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
      polygon: myPolygon,
      rating: Math.random() * 4.8,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const insert = await db.collection('projects').add(res);
    console.log('Added document with ID: ', insert.id);
  });
 };

 const LoadUnits = async function (data) {
  data.map(async (item) => {
    const res = {
      code: item.Id,
      category: item.Property_Category.trim().toLowerCase(),
      type: item.Property_Type.trim().replaceAll(' ', '-').toLowerCase(),
      finishingType: item.Property_Finishing_Type.trim()
        .replaceAll(' ', '-')
        .toLowerCase(),
      priceBase: parseFloat(item.PriceBase),
      spaceBuildUp: parseFloat(item.SpaceBuildUp),
      pricePerMeter: parseFloat(item.PricePerMeter),
      paymentYears: parseFloat(item.Payment_Years),
      estDelivery: parseFloat(item.EstDelivery),
      city: item.Project_City.toLowerCase(),
      country: item.Project_Country.toLowerCase(),
      area: item.Project_Area.toLowerCase(),
      developer: item.Developer,
      project: item.Project_Name.toLowerCase(),
      licence: item.Licence.trim().toLowerCase(),
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    }

    const insert = await db.collection('units').add(res);
    console.log('Added document with ID: ', insert.id);
  })
 
}

async function run() {
  try {
    let Projects = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    );
    let Developers = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[1]]
    );
    let Units = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[2]]);

    await LoadUnits(Units);
  } finally {
    console.log("Finish scanning XLSX file ...");
  }
}
run().catch(console.dir);
