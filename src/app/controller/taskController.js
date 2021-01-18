const express = require("express");
const authMiddleware = require("../middlewares/auth");
const Task = require("../models/tasks");

const router = express.Router();

router.use(authMiddleware);

router.get("/list/:user", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.params.user })

    res.send({ ok: true, tasks });
  } catch (err) {
    res.status(400).send({ ok: false, message: 'Failed to load tasks' });
  }
});

router.get("/:taskid", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskid)

    res.send({ ok: true, task });
  } catch (err) {
    res.status(400).send({ ok: false, message: 'Failed to load task' });
  }
});

router.post("/create", async (req, res) => {
  try {
    const task = await Task.create(req.body);

    res.send({ ok: true, task, userId: req.userId });
  } catch (err) {
    res.status(400).send({ ok: false, message: 'Failed to create task' });
  }
});

router.put("/:taskid", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.taskid, req.body, { new: true });

    res.send({ ok: true, task });
  } catch (err) {
    res.status(400).send({ ok: false, message: 'Failed to update task' });
  }
});

router.delete("/:taskid", async (req, res) => {
  try {
    await Task.findByIdAndRemove(req.params.taskid);

    res.send({ ok: true });
  } catch (err) {
    res.status(400).send({ ok: false, message: 'Failed to delete task' });
  }
});

module.exports = (app) => app.use("/task", router);
