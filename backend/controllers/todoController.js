const Todo = require("../models/Todo");

exports.createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;

    const todo = await Todo.create({
      title,
      description,
    });

    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodos = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 5;

    const skip = (page - 1) * limit;

    const todos = await Todo.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Todo.countDocuments();

    res.json({
      todos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(todo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTodo = async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);

    res.json({ message: "Todo deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};