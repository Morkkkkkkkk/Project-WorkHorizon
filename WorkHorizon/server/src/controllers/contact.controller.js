import prisma from "../config.js";

// Public: Create a new contact request
export const createContactRequest = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newRequest = await prisma.contactRequest.create({
      data: {
        name,
        email,
        subject,
        message,
      },
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating contact request:", error);
    res.status(500).json({ error: "Failed to submit contact request" });
  }
};

// Admin: Get all contact requests
export const getAllContactRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional filter by status

    const where = status ? { status } : {};

    const totalRequests = await prisma.contactRequest.count({ where });
    const totalPages = Math.ceil(totalRequests / limit);

    const requests = await prisma.contactRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      requests,
      totalPages,
      currentPage: page,
      totalRequests,
    });
  } catch (error) {
    console.error("Error fetching contact requests:", error);
    res.status(500).json({ error: "Failed to fetch contact requests" });
  }
};

// Admin: Update status (Mark as Read / Replied)
export const updateContactRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["PENDING", "READ", "REPLIED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedRequest = await prisma.contactRequest.update({
      where: { id },
      data: { status },
    });

    res.json(updatedRequest);
  } catch (error) {
    console.error("Error updating contact request:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};
