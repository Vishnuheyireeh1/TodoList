const express = require("express");
const router = express.Router();

const {
  createTodo,
  getTodos,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController");

router.post("/create", createTodo);
router.get("/get", getTodos);
router.put("/update/:id", updateTodo);
router.delete("/delete/:id", deleteTodo);

module.exports = router;