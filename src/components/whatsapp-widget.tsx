"use client";

import { useState } from "react";

export function FloatingWhatsAppWidget() {
  const [hovered, setHovered] = useState(false);
  const phoneNumber = "+91 7305771789";
  const whatsappUrl =
    "https://wa.me/917305771789?text=Hello%20Zentrion%20Learntech%2C%20I%20want%20to%20know%20more%20about%20your%20courses%20and%20AI%20programs.";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        flexDirection: "row-reverse",
        gap: "10px",
      }}
    >
      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label={`Chat with Zentrion Learntech on WhatsApp at ${phoneNumber}`}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#25D366",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF",
          boxShadow: "0 6px 20px rgba(37, 211, 102, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2)",
          textDecoration: "none",
          transition: "transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease",
          transform: hovered ? "scale(1.08)" : "scale(1)",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.16 8.16 0 0 1 2.4 5.83c0 4.54-3.7 8.24-8.24 8.24-1.45 0-2.88-.38-4.13-1.11l-.3-.18-3.07.81.82-2.99-.19-.31a8.164 8.164 0 0 1-1.25-4.46c0-4.54 3.69-8.24 8.24-8.24zm4.5 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42-.14 0-.31-.02-.47-.02s-.44.06-.67.31c-.23.25-.88.86-.88 2.1 0 1.23.9 2.42 1.02 2.59.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.1-.22-.17-.47-.29z" />
        </svg>
      </a>

      {/* Hover Info Tooltip / Badge */}
      <div
        style={{
          background: "var(--card-bg, rgba(10, 15, 29, 0.95))",
          border: "1px solid var(--border-strong, rgba(255, 255, 255, 0.15))",
          color: "var(--text, #F8FAFC)",
          padding: "0.5rem 0.85rem",
          borderRadius: "0.6rem",
          fontSize: "0.82rem",
          fontWeight: 600,
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
          display: hovered ? "flex" : "none",
          alignItems: "center",
          gap: "0.4rem",
          pointerEvents: "none",
        }}
      >
        <span style={{ color: "#25D366" }}>●</span>
        <span>Chat on WhatsApp: <strong>{phoneNumber}</strong></span>
      </div>
    </div>
  );
}
