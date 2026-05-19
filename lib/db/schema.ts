import { pgTable, serial, text, timestamp, varchar, integer, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: varchar("role", { length: 50 }).default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRoleEnum = pgEnum("user_role", ["seller", "buyer", "services"]);

export const sellers = pgTable("sellers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  companyName: varchar("company_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  verified: boolean("verified").default(false).notNull(),
  kycDocument: text("kyc_document"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const buyers = pgTable("buyers", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  phone: varchar("phone", { length: 50 }),
  preferredLocation: text("preferred_location"),
  budgetMin: decimal("budget_min", { precision: 12, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  companyName: varchar("company_name", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  serviceType: varchar("service_type", { length: 100 }),
  description: text("description"),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const offeringStatusEnum = pgEnum("offering_status", ["active", "paused"]);

export const service_offerings = pgTable("service_offerings", {
  id: serial("id").primaryKey(),
  providerId: text("provider_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description"),
  priceMin: decimal("price_min", { precision: 12, scale: 2 }),
  priceMax: decimal("price_max", { precision: 12, scale: 2 }),
  status: offeringStatusEnum("status").default("active").notNull(),
  ordersCount: integer("orders_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const propertyStatusEnum = pgEnum("property_status", ["available", "sold", "pending", "reserved"]);
export const propertyTypeEnum = pgEnum("property_type", ["apartment", "villa", "house", "land", "commercial", "office"]);

export const properties = pgTable("properties", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id").notNull().references(() => sellers.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  type: propertyTypeEnum("type").notNull(),
  status: propertyStatusEnum("status").default("available").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  area: decimal("area", { precision: 10, scale: 2 }),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  wilayaId: integer("wilaya_id"),
  wilayaName: varchar("wilaya_name", { length: 100 }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  images: text("images").array(),
  features: text("features").array(),
  polygon: text("polygon"),
  titleDeedDocument: text("title_deed_document"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const savedProperties = pgTable("saved_properties", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  propertyId: integer("property_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const serviceRequestStatusEnum = pgEnum("service_request_status", ["new", "contacted", "closed", "cancelled"]);

export const serviceRequests = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  buyerId: text("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: text("provider_id").notNull().references(() => services.id, { onDelete: "cascade" }),
  serviceType: varchar("service_type", { length: 100 }).notNull(),
  message: text("message"),
  status: serviceRequestStatusEnum("status").default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
