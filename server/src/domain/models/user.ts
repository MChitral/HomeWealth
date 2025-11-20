import {
  type InsertUser,
  type User,
  insertUserSchema,
} from "@shared/schema";

export type UserEntity = User;
export type UserCreateInput = InsertUser;

export const userCreateSchema = insertUserSchema;

