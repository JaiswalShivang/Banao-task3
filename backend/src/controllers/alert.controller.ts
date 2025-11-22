import type { Request, Response } from "express";
import prisma from "../config/database.js";

interface AuthRequest extends Request {
  user?: any;
}

export const createAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { coinId, condition, targetPrice } = req.body;
    const userId = req.user?.id;

    if (!userId || !coinId || !condition || !targetPrice) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        coinId,
        condition,
        targetPrice: parseFloat(targetPrice),
      },
    });

    res.status(201).json(alert);
  } catch (error) {
    console.error("Error creating alert:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json(alerts);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { alertId } = req.params;
    const userId = req.user?.id;

    if (!userId || !alertId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const alert = await prisma.alert.findUnique({
      where: { id: parseInt(alertId) },
    });

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    if (alert.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await prisma.alert.delete({
      where: { id: parseInt(alertId) },
    });

    res.status(200).json({ message: "Alert deleted successfully" });
  } catch (error) {
    console.error("Error deleting alert:", error);
    res.status(500).json({
      message: "Server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
