const express = require("express");

const NotifRouter = express.Router();

const Notifications = require("../models/Notifications");
NotifRouter.get("/myNotifications/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and 10 notifications per page

    // Calculate the number of documents to skip
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch notifications with pagination
    const notifications = await Notifications.find({ userId })
      .sort({ createdAt: -1 }) // Sort by most recent notifications
      .skip(skip)
      .limit(parseInt(limit))
      .select("-__v");

    // Mark all fetched notifications as read
    const notificationIds = notifications.map((noti) => noti._id); // Extract the IDs of the fetched notifications
    await Notifications.updateMany(
      { _id: { $in: notificationIds }, isRead: false }, // Filter by fetched notifications that are unread
      { $set: { isRead: true } } // Mark them as read
    );

    // Get total notifications count for pagination metadata
    const totalNotifications = await Notifications.countDocuments({ userId });

    return res.status(200).json({
      notifications: notifications,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalNotifications / parseInt(limit)),
      totalNotifications,
    });
  } catch (error) {
    console.error("Error fetching or updating notifications:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});
NotifRouter.get("/hasUnreadNotifications/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if there are any unread notifications for the user
    const hasUnread = await Notifications.exists({ userId, isRead: false });

    // Return "yes" if unread notifications exist, otherwise "no"
    return res.status(200).json({ hasUnread: hasUnread ? "yes" : "no" });
  } catch (error) {
    console.error("Error checking unread notifications:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = NotifRouter;
