// server/src/controllers/messages.controller.js
import { prisma } from "../services/prisma.js";

// List messages in a conversation (chronological).
export async function listMessages(req, res) {
  const { conversationId } = req.query;
  if (!conversationId) return res.status(400).json({ error: "conversationId is required" });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    include: { sender: { select: { id: true, fullName: true, email: true, role: true } } },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  res.json({ messages });
}

export async function createMessage(req, res) {
  const { conversationId, content, fileUrl, fileName, fileType } = req.body;
  if (!conversationId || (!content && !fileUrl)) {
    return res.status(400).json({ error: "conversationId and content are required" });
  }
  const message = await prisma.message.create({
    data: {
      conversationId,
      content: content || "",
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileType: fileType || null,
      senderId: req.user.id,
    },
    include: { sender: { select: { id: true, fullName: true, email: true, role: true } } },
  });
  res.status(201).json({ message });
}
