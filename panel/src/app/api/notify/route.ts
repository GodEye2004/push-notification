"use strict";

import { admin } from "@/lib/firebase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { title, body, imageUrl, target, data, appName } = await req.json();

    // 1. Send to Local Node.js Server (Socket.io bridge for Flutter)
    try {
      console.log("Forwarding to index.js:", { title, body, imageUrl });
      const nodeRes = await fetch(
        "http://192.168.100.102:5001/send-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body, imageUrl }),
        },
      );
      const nodeData = await nodeRes.json();
      console.log("Node.js server response:", nodeData);
    } catch (nodeError) {
      console.error("Failed to forward to Node.js server:", nodeError);
    }

    // 2. Send via FCM (if target is specified)
    let fcmResponse = null;
    // TODO: Fix this issue
    try {
      const message: any = {
        notification: {
          title,
          body,
          ...(imageUrl && { imageUrl }),
        },
        data: data || {},
      };

      if (target === "all") {
        message.topic = "all";
      } else if (target && target !== "all") {
        message.token = target;
      }

      if (message.topic || message.token) {
        fcmResponse = await admin.messaging().send(message);
      }
    } catch (fcmError) {
      console.warn("FCM delivery skipped or failed:", fcmError);
    }

    return NextResponse.json({
      success: true,
      fcmMessageId: fcmResponse,
      nodeForwarded: true,
    });
  } catch (error: any) {
    console.error("General Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
