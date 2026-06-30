import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const sql = neon(process.env.DATABASE_URL)

/**
 * Drizzle client over the Neon HTTP driver.
 * Use this for all DB reads/writes in API routes and server components.
 */
export const db = drizzle(sql, { schema })
