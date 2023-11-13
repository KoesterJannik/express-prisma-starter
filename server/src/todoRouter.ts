import express from "express";
import { isAuthenticated } from "./middleware";
import prisma from "./db";

const todoRouter = express.Router();

todoRouter.post("/newTodo", isAuthenticated, async (req: any, res) => {
  const newTodo = req.body.todoName;
  await prisma.todo.create({
    data: {
      title: newTodo,
      userId: req.userId,
    },
  });
  return res.redirect("/dashboard");
});

export default todoRouter;
