"use client";

import { useState } from "react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  sender: string;
  avatarColor: string;
  text: string;
  time: string;
}

const INITIAL_CHATS: ChatMessage[] = [
  { id: "1", sender: "Sarah Chip", avatarColor: "#EC4899", text: "This is amazing!", time: "19:04" },
  { id: "2", sender: "John Doe", avatarColor: "#3B82F6", text: "Can you explain again?", time: "19:05" },
  { id: "3", sender: "Alex Miller", avatarColor: "#10B981", text: "Very clear explanation 👏", time: "19:05" },
  { id: "4", sender: "Priya S.", avatarColor: "#F59E0B", text: "Great session!", time: "19:06" },
  { id: "5", sender: "Faster Boy", avatarColor: "#8B5CF6", text: "Sorry to freepass/interrupt!", time: "19:07" },
];

export function LiveClassroom() {
  const [chats, setChats] = useState<ChatMessage[]>(INITIAL_CHATS);
  const [chatInput, setChatInput] = useState("");
  const [isMicMuted, setIsMicMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "notes" | "qa" | "resources">("content");
  const [activeLeftTool, setActiveLeftTool] = useState("code");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "You",
      avatarColor: "#22D3EE",
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setChats((prev) => [...prev, newMsg]);
    setChatInput("");
  };

  return (
    <div style={{ background: "#060913", color: "#F8FAFC", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Studio Bar */}
      <div
        style={{
          height: "60px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "#0A0F1D",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 1.5rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              color: "#FFFFFF",
              fontWeight: 800,
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "0.4rem",
                background: "linear-gradient(135deg, #6366F1, #22D3EE)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "0.9rem",
              }}
            >
              Z
            </div>
            <span>Zentrion Live Studio</span>
          </Link>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.25rem 0.65rem",
              borderRadius: "9999px",
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#F87171",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", display: "inline-block" }} />
            LIVE
          </span>

          <span style={{ color: "#94A3B8", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
            👥 1.2K viewers
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ color: "#E2E8F0", fontSize: "0.9rem", fontWeight: 600 }}>
            Session: Multi-Agent Architectures & Tool Use
          </span>
          <Link
            href="/courses"
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "0.5rem",
              background: "rgba(239, 68, 68, 0.15)",
              color: "#F87171",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Leave
          </Link>
        </div>
      </div>

      {/* Main Studio Workspace Grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "64px 1fr 340px", minHeight: "calc(100vh - 60px)" }}>
        {/* Left Toolbar */}
        <aside
          style={{
            background: "#080C19",
            borderRight: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "1rem 0",
            gap: "1.25rem",
          }}
        >
          {[
            { id: "code", icon: "</>", label: "Code" },
            { id: "board", icon: "✏️", label: "Whiteboard" },
            { id: "docs", icon: "📄", label: "Docs" },
            { id: "notes", icon: "📝", label: "Notes" },
            { id: "settings", icon: "⚙️", label: "Settings" },
          ].map((tool) => (
            <button
              key={tool.id}
              type="button"
              title={tool.label}
              onClick={() => setActiveLeftTool(tool.id)}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "0.6rem",
                background: activeLeftTool === tool.id ? "rgba(99, 102, 241, 0.25)" : "transparent",
                border: activeLeftTool === tool.id ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid transparent",
                color: activeLeftTool === tool.id ? "#22D3EE" : "#94A3B8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {tool.icon}
            </button>
          ))}
        </aside>

        {/* Center Main Stage + Bottom Tabs */}
        <div style={{ display: "flex", flexDirection: "column", background: "#060913", overflowY: "auto" }}>
          {/* Video Stream Stage */}
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "16 / 9",
              maxHeight: "520px",
              background: "#000000",
              overflow: "hidden",
            }}
          >
            <img
              src="/images/live-instructor.jpg"
              alt="Live Instructor Stream"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* Top Video Overlay Info */}
            <div
              style={{
                position: "absolute",
                top: "1rem",
                left: "1rem",
                padding: "0.4rem 0.8rem",
                borderRadius: "0.5rem",
                background: "rgba(10, 15, 29, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#22D3EE" }}>✦</span> Arjun Varma (Lead AI Instructor)
            </div>

            {/* Bottom Classroom Controls Bar */}
            <div
              style={{
                position: "absolute",
                bottom: "1.25rem",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.6rem 1.25rem",
                borderRadius: "9999px",
                background: "rgba(10, 15, 29, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <button
                type="button"
                onClick={() => setIsMicMuted(!isMicMuted)}
                title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: isMicMuted ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  border: isMicMuted ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: isMicMuted ? "#F87171" : "#FFFFFF",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                {isMicMuted ? "🔇" : "🎙️"}
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)}
                title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: isVideoOff ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.1)",
                  border: isVideoOff ? "1px solid #EF4444" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: isVideoOff ? "#F87171" : "#FFFFFF",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                {isVideoOff ? "📷🚫" : "📹"}
              </button>

              <button
                type="button"
                title="Share Screen"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "#FFFFFF",
                  fontSize: "1rem",
                  cursor: "pointer",
                }}
              >
                🖥️
              </button>

              <button
                type="button"
                onClick={() => setIsHandRaised(!isHandRaised)}
                title={isHandRaised ? "Lower Hand" : "Raise Hand"}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: isHandRaised ? "rgba(245, 158, 11, 0.25)" : "rgba(255, 255, 255, 0.1)",
                  border: isHandRaised ? "1px solid #F59E0B" : "1px solid rgba(255, 255, 255, 0.15)",
                  color: isHandRaised ? "#FBBF24" : "#FFFFFF",
                  fontSize: "1.1rem",
                  cursor: "pointer",
                }}
              >
                ✋
              </button>

              <Link
                href="/courses"
                title="Leave Session"
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "9999px",
                  background: "#EF4444",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                Leave
              </Link>
            </div>
          </div>

          {/* Bottom Tabs & Syllabus Area */}
          <div style={{ padding: "1.5rem", flex: 1 }}>
            {/* Tabs Bar */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "1.25rem",
              }}
            >
              {[
                { id: "content", label: "Course Content" },
                { id: "notes", label: "Live Notes" },
                { id: "qa", label: "Q&A" },
                { id: "resources", label: "Resources" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "0.6rem 0",
                    fontSize: "0.9rem",
                    fontWeight: activeTab === tab.id ? 700 : 500,
                    color: activeTab === tab.id ? "#22D3EE" : "#94A3B8",
                    borderBottom: activeTab === tab.id ? "2px solid #22D3EE" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {activeTab === "content" && (
              <div>
                <div
                  style={{
                    padding: "1rem 1.25rem",
                    borderRadius: "0.75rem",
                    background: "rgba(10, 15, 29, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    marginBottom: "0.75rem",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#FFFFFF", marginBottom: "0.75rem" }}>
                    Module 1: Introduction to AI & Agentic Systems
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#E2E8F0" }}>1. What is AI & Agentic Architecture?</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ color: "#64748B" }}>10:15</span>
                        <span style={{ color: "#10B981", fontWeight: 700 }}>✓ Completed</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#22D3EE", fontWeight: 600 }}>2. Applications of Autonomous AI Agents</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ color: "#64748B" }}>15:20</span>
                        <span style={{ color: "#22D3EE", fontWeight: 700 }}>● Ongoing</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.85rem" }}>
                      <span style={{ color: "#94A3B8" }}>3. Setting up Python Environment & Tool Schemas</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ color: "#64748B" }}>20:00</span>
                        <span style={{ color: "#64748B" }}>○ Upcoming</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.6 }}>
                <p>• Key Takeaway: Autonomous agents require deterministic tool schemas and memory barriers.</p>
                <p>• Recommended python library: pydantic for structured validation contracts.</p>
              </div>
            )}

            {activeTab === "qa" && (
              <div style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
                Ask instructor directly or vote up questions during the live session.
              </div>
            )}

            {activeTab === "resources" && (
              <div style={{ color: "#94A3B8", fontSize: "0.9rem" }}>
                <a href="/courses" style={{ color: "#818CF8" }}>Download Lecture Slides (.PDF)</a> ·{" "}
                <a href="/labs" style={{ color: "#818CF8" }}>Companion GitHub Sandbox</a>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Live Chat Stream */}
        <aside
          style={{
            background: "#0A0F1D",
            borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div
            style={{
              padding: "1rem 1.25rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              fontWeight: 700,
              fontSize: "0.95rem",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Live Chat</span>
            <span style={{ fontSize: "0.75rem", color: "#10B981" }}>● Active</span>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              padding: "1rem",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
            }}
          >
            {chats.map((msg) => (
              <div key={msg.id} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: msg.avatarColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    color: "#FFFFFF",
                    flexShrink: 0,
                  }}
                >
                  {msg.sender.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#E2E8F0" }}>{msg.sender}</span>
                    <span style={{ fontSize: "0.7rem", color: "#64748B" }}>{msg.time}</span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94A3B8", marginTop: "2px", lineHeight: 1.4 }}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input Box */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "0.85rem 1rem",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              background: "#080C19",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: "0.6rem 0.85rem",
                borderRadius: "0.5rem",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#FFFFFF",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                color: "#FFFFFF",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
