import ContactMessage from "../models/ContactMessage.js";

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, email, subject, message).",
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must be at least 2 characters long.",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    if (trimmedMessage.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Message must be at least 10 characters long.",
      });
    }

    const newMessage = await ContactMessage.create({
      name: trimmedName,
      email: trimmedEmail,
      subject: trimmedSubject,
      message: trimmedMessage,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out! Your message has been sent successfully.",
      data: {
        id: newMessage._id,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact Form Submission Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message. Please try again later.",
    });
  }
};

// @desc    Get all contact messages (for Admin)
// @route   GET /api/contact
// @access  Private (Admin)
export const getContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get Contact Messages Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve contact messages.",
    });
  }
};

