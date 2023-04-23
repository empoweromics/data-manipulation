import { Document, MongoClient } from 'mongodb'
import 'dotenv/config'

interface LocationHelper {
  name: string
  type: 'country' | 'city' | 'area'
  ancestors: Array<string>
}

interface Unit extends Document {
  code: string
  category: string
  type: string
  finishingType: string
  priceBase: number
  spaceBuildUp: number
  pricePerMeter: number
  paymentYears: number
  estDelivery: number
  city: string
  country: string
  area: string
  developer: string
  project: string
  licence: string
  active: boolean
  created_at: Date
  updated_at: Date
}

const client = new MongoClient(process.env.MONGO_URI as string)

function checkConfig() {
  if (!process.env.MONGO_URI) throw Error('MONGO_URI is Not Set!')
}

async function getDb() {
  return client.db('empoweromics')
}

async function CreateLocationHelper() {
  const db = await getDb()
  const unitsCol = db.collection<Unit>('units')
  const helperCol = db.collection('helper')
  let processed = 0
  const locationHelper: Array<LocationHelper> = []

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const curUnits = unitsCol.find({}).sort({ _id: 1 }).skip(processed)
    try {
      while (await curUnits.hasNext()) {
        const unit = await curUnits.next()
        if (!unit) break
        console.log(processed, " >>> ", unit._id)
        if (!locationHelper.find(element => element.name === unit.country))
          locationHelper.push({
            name: unit.country,
            type: 'country',
            ancestors: []
          })
        if (!locationHelper.find(element => element.name === unit.city))
        locationHelper.push({
          name: unit.city,
          type: 'city',
          ancestors: [unit.country]
        })
        if (!locationHelper.find(element => element.name === unit.area))
        locationHelper.push({
          name: unit.area,
          type: 'area',
          ancestors: [unit.country, unit.city]
        })
        ++processed
      }
      await helperCol.insertMany(locationHelper)
      await helperCol.createIndex({ ancestors: 1 })
      break // Done processing all, exit outer loop
    } catch (err: unknown) {
      if ((err as { code: number }).code !== 43) {
        // Something else than a timeout went wrong. Abort loop.
        throw err
      }
      console.log('Reconnecting.')
    }
  }
}

async function start() {
  checkConfig()
  return CreateLocationHelper()
}

start()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close())
