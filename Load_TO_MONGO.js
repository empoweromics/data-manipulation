var XLSX = require('xlsx')
var MongoClient = require('mongodb').MongoClient
const dotenv = require('dotenv')
dotenv.config()

var workbook = XLSX.readFile('AI_26012023.xlsx')
var sheet_name_list = workbook.SheetNames

const uri = process.env.MONGO_URI
const client = new MongoClient(uri)
const database = client.db('empoweromics')

const LoadDevelopers = async function (data) {
  const dev = data.map(item => {
    return {
      name: item.developer_name,
      website: item.Website,
      area: item.Area.toLowerCase(),
      city: item.City.toLowerCase(),
      country: item.Country.toLowerCase(),
      description: item.Description,
      logo: item.UrltoLogo,
      rating: Math.random() * 4.8,
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  const _developers = database.collection('developers')
  // create a document to insert
  // this option prevents additional documents from being inserted if one fails

  const options = { ordered: true }
  const result = await _developers.insertMany(dev, options)
  console.log(`A document was inserted with the _id: `)
  console.table(result.insertedIds)
}

const LoadProjects = async function (data) {
  const pro = data.map(item => {
    let geoLocate = item.GeoLocation + ''
    let geoLocateArr = geoLocate
      .split('((')
      .join('')
      .split('))')
      .join(' ')
      .split('POLYGON')
      .join(' ')
      .split(', ')
      .join(' ')
      .trim()
      .split(' ')
    let geoJsonConverted = [[]]
    for (let i = 0; i < geoLocateArr.length; i += 2) {
      geoJsonConverted[0].push([
        parseFloat(geoLocateArr[i]),
        parseFloat(geoLocateArr[i + 1])
      ])
    }

    let polygonHasNull = false
    geoJsonConverted[0].map(secondD =>
      secondD.map(item => {
        if (!item) polygonHasNull = true
        return item
      })
    )
    return {
      code: item.ID,
      name: item.Name.toLowerCase(),
      polygonHasNull,
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
        type: 'Polygon',
        coordinates: geoJsonConverted
      },
      rating: Math.random() * 4.8,
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  })
  const _projects = database.collection('projects')
  // create a document to insert
  // this option prevents additional documents from being inserted if one fails
  const options = { ordered: true }

  //console.log(pro[0]);
  const result = await _projects.insertMany(pro, options)
  console.log(`A document was inserted with the _id: `)
  console.table(result.insertedIds)
}

const LoadUnits = async function (data) {
  const units = data.map(item => {
    return {
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
  })
  const _units = database.collection('units')
  // create a document to insert
  // this option prevents additional documents from being inserted if one fails
  //console.log(units[0]);
  const options = { ordered: true }
  const result = await _units.insertMany(units, options)
  console.log(`A document was inserted with the _id: `)
  console.table(result.insertedIds)
}

async function run() {
  try {
    let Projects = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    // let Developers = XLSX.utils.sheet_to_json(
    //   workbook.Sheets[sheet_name_list[1]]
    // )
    // let Units = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[2]])
    //
    await LoadProjects(Projects)
  } finally {
    await client.close()
  }
}
run().catch(console.dir)
