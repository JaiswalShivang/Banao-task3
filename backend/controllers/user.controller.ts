import prisma from "../config/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import type { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("Register request:", { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    console.log("Login request:", { email, hasPassword: !!password });

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (!existingUser) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const payload = {
      id: existingUser.id,
      email: existingUser.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "12h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
