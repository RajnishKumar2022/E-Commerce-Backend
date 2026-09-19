import { date, text, pgTable, timestamp, varchar, pgEnum, uuid, boolean } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('user_role', ['admin', 'customer', 'seller']);

export const userTable = pgTable("users", {
  id: uuid('id').primaryKey().defaultRandom(),

  firstName: varchar("first_name",{ length: 50 }).notNull(),
  lastName: varchar("last_name",{length:50}),

  email: varchar("email",{ length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),

  password: varchar("password", { length: 100}),
  salt: text('salt'),

  role: roleEnum().default("customer"),
  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date())
});
