import { Request, Response } from "express";
import { db } from "../config/index.js";
import { menu } from "../config/db/schema.js";

export const allMenu = async (req: Request, res: Response) => {
  try {
    const menuItems = await db.select().from(menu);

    res.status(200).json({ data: menuItems });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};

export const menuData = [
  { name: "Beans with plantain and egg", price: "75.0", quantity: 0 },
  { name: "Beans with plantain, egg and fish", price: "90.0", quantity: 0 },
  { name: "Beans with plantain, egg and meat", price: "95.0", quantity: 0 },
  { name: "Beans with plantain, egg and chicken", price: "90.0", quantity: 0 },
  { name: "Beans and rice with plantain and egg", price: "85.0", quantity: 0 },
  {
    name: "Beans and rice with plantain, egg and chicken",
    price: "100.0",
    quantity: 0,
  },
  {
    name: "Beans and rice with plantain, egg and meat",
    price: "105.0",
    quantity: 0,
  },
  {
    name: "Beans and rice with plantain, egg and fish",
    price: "100.0",
    quantity: 0,
  },
  {
    name: "Beans and rice with plantain, egg, fish and meat",
    price: "120.0",
    quantity: 0,
  },
  {
    name: "Beans and rice with plantain, egg, fish and chicken",
    price: "120.0",
    quantity: 0,
  },
  { name: "Plain rice and stew with red fish", price: "90.0", quantity: 0 },
  { name: "Plain rice with stew and chicken", price: "90.0", quantity: 0 },
  { name: "Plain rice and beef", price: "90.0", quantity: 0 },
  { name: "Fried Rice with chicken", price: "100.0", quantity: 0 },
  { name: "Fried Rice with cow meat", price: "100.0", quantity: 0 },
  { name: "Fried Rice with red fish", price: "100.0", quantity: 0 },
  { name: "Jollof with chicken", price: "100.0", quantity: 0 },
  { name: "Jollof with cow meat", price: "100.0", quantity: 0 },
  { name: "Jollof with red fish", price: "100.0", quantity: 0 },
  {
    name: "Banku with okro stew (crab, Wele & Meat)",
    price: "100.0",
    quantity: 0,
  },
  {
    name: "Banku with okro stew (crab, Wele,fish & Meat)",
    price: "120.0",
    quantity: 0,
  },
  { name: "Extra plantain", price: "10.0", quantity: 0 },
  { name: "Extra chicken", price: "15.0", quantity: 0 },
  { name: "Extra beef", price: "20.0", quantity: 0 },
  { name: "Extra cow meat", price: "20.0", quantity: 0 },
  { name: "Extra fish", price: "20.0", quantity: 0 },
  { name: "Extra egg", price: "5.0", quantity: 0 },
];

export const addMenu = async (req: Request, res: Response) => {
  try {
    const men = await db.insert(menu).values(menuData);
    res.status(201).json({
      message: "Menu created successfully",
      data: men[0],
    });
  } catch (error) {
    console.error("Add Menu Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
