import { config } from "dotenv";
config();

import express from "express";
import cookieParser from "cookie-parser";
import prisma from "./db";
import {
  comparePassword,
  createJwtToken,
  hashPassword,
  verifyToken,
} from "./encryption";
import { isAuthenticated } from "./middleware";
import todoRouter from "./todoRouter";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use("/todo", todoRouter);

app.get("/", async (req, res) => {
  return res.render("pages/index");
});

app.post("/register", async (req, res) => {
  console.log(req.body);

  const email = req.body.email;
  const password = req.body.password;
  const isEmailInUse = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (isEmailInUse)
    return res.render("pages/register", {
      message: "Email already in use",
    });

  const hashedPassword = await hashPassword(password);
  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });
  return res.render("pages/login", {
    message: "User created successfully",
  });
});
app.get("/register", async (req, res) => {
  return res.render("pages/register", {
    message: "",
  });
});

app.post("/login", async (req, res) => {
  const username = req.body.email;
  const password = req.body.password;

  console.log(username, password);

  const doesUserExist = await prisma.user.findUnique({
    where: {
      email: username,
    },
  });
  if (!doesUserExist)
    return res.render("pages/login", {
      message: "User does not exist",
    });

  const wasPasswordCorrect = await comparePassword(
    password,
    doesUserExist.password
  );
  if (!wasPasswordCorrect)
    return res.render("pages/login", {
      message: "Incorrect password",
    });

  const token = createJwtToken(doesUserExist.id);
  console.log(token);
  // set as cookie
  res.cookie("token", token, {
    httpOnly: process.env.NODE_ENV === "production" ? true : false,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return res.redirect("/dashboard");
});

app.get("/login", async (req, res) => {
  return res.render("pages/login", {
    message: "",
  });
});

app.get("/dashboard", isAuthenticated, async (req: any, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: Number(req.userId),
    },
    include: {
      Todo: true,
    },
  });
  return res.render("pages/dashboard", {
    user,
  });
});

app.get("/logout", async (req, res) => {
  res.clearCookie("token");
  return res.redirect("/login");
});

app.listen(3000, () => {
  console.log(`Server listening on port ${3000}`);
});
