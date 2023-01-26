import express from "express";
import { createItem, deleteItem, getItem, getItems, updateItem } from "../controllers/comments.js";
import { validatorCreateComment } from "../validators/comments.js";

const router = express.Router();

router.get("/", getItems);
router.get("/:id", getItem);
router.post("/",validatorCreateComment, createItem);
router.put("/:id",  updateItem);
router.delete("/:id", deleteItem);

export default router;
