import { Document, MongoClient } from 'mongodb'
import fs from 'fs'
import 'dotenv/config'

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

async function createJsonFlatList() {
  const db = await getDb()
  const unitsCol = db.collection<Unit>('units')
  let processed = 0
  const category = new Set()
  const type = new Set()
  const finishingType = new Set()
  const developer = new Set()
  const project = new Set()
  const licence = new Set()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const curUnits = unitsCol.find({}).sort({ _id: 1 }).skip(processed)
    try {
      while (await curUnits.hasNext()) {
        const unit = await curUnits.next()
        if (!unit) break
        category.add(unit.category)
        type.add(unit.type)
        finishingType.add(unit.finishingType)
        developer.add(unit.developer)
        project.add(unit.project)
        licence.add(unit.licence)
        console.log(processed, unit._id)
        ++processed
      }
      fs.writeFile(
        './output/flatLists.json',
        JSON.stringify(
          {
            category: Array.from(category),
            type: Array.from(type),
            finishingType: Array.from(finishingType),
            developer: Array.from(developer),
            project: Array.from(project),
            licence: Array.from(licence)
          },
          null,
          2
        ),
        () => {
          console.log('Finished File Write')
        }
      )
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
  return createJsonFlatList()
}

start()
  .then(console.log)
  .catch(console.error)
  .finally(() => client.close())
