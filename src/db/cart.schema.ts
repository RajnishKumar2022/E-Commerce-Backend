import { pgTable, uuid } from "drizzle-orm/pg-core"

export const cartTable = pgTable('cart', {
    id: uuid('id').primaryKey().defaultRandom(),
})