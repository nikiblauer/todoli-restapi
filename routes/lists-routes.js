const express = require("express");
const { check } = require("express-validator");

const router = express.Router();

const listsController = require("../controllers/lists-controller");
const authMiddleware = require("../middleware/check-auth");

router.use(authMiddleware);

router.get("/", listsController.getLists);

router.get("/:listId", listsController.getList);

router.post("/", check("title").not().isEmpty(), listsController.createList);

router.patch(
  "/:listId",
  [check("title").not().isEmpty(), check("items").isArray()],
  listsController.updateList
);

router.delete("/:listId", listsController.deleteList);

module.exports = router;
