"use client";

import { useState } from "react";
import Link from "next/link";

const TRACKS = [
  { id: "ai-ml", name: "Artificial Intelligence & ML", icon: "🤖", labs: 45, semesters: "4 Semesters", aicte: "AICTE Mapped" },
  { id: "cybersecurity", name: "Cybersecurity & SOC Labs", icon: "🛡️", labs: 38, semesters: "2 Semesters", aicte: "Hands-on CTF" },
  { id: "data-science", name: "Data Science & Predictive Analytics", icon: "📊", labs: 40, semesters: "3 Semesters", aicte: "Industry Aligned" },
  { id: "full-stack", name: "Full-Stack Dev with GenAI", icon: "🌐", labs: 52, semesters: "4 Semesters", aicte: "Project Based" },
  { id: "agentic-ai", name: "Agentic AI & Automation", icon: "⚡", labs: 30, semesters: "2 Semesters", aicte: "2026 Trending" },
];

export function CollegeCurriculumEstimator() {
  const [studentCount, setStudentCount] = useState<number>(300);
  const [selectedTracks, setSelectedTracks] = useState<string[]>(["ai-ml", "cybersecurity"]);
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);

  const toggleTrack = (id: string) => {
    if (selectedTracks.includes(id)) {
      if (selectedTracks.length > 1) {
        setSelectedTracks(selectedTracks.filter((t) => t !== id));
      }
    } else {
      setSelectedTracks([...selectedTracks, id]);
    }
  };

  // Hardware and infrastructure lab cost calculations:
  // Typical physical lab costs ~₹18,000 per student seat per year (servers, maintenance, licenses)
  // Zentrion in-browser cloud labs reduce hardware procurement by ~60%
  const physicalLabCost = studentCount * 18000;
  const estimatedSavings = Math.round(physicalLabCost * 0.6);
  const facultyHoursSaved = studentCount * 8; // automated code evaluation & lab auto-grading

  const formatLakhs = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakhs`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  return (
    <div
      id="campus-planner"
      style={{
        borderRadius: "1.5rem",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 29, 0.9) 100%)",
        border: "1px solid rgba(34, 211, 238, 0.25)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 211, 238, 0.08)",
        padding: "2.5rem 2rem",
        backdropFilter: "blur(20px)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0.85rem", borderRadius: "9999px", background: "rgba(34, 211, 238, 0.12)", border: "1px solid rgba(34, 211, 238, 0.25)", color: "#22D3EE", fontSize: "0.8rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            <span>🎓</span> Interactive Campus Deployment Planner
          </div>
          <h3 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.02em" }}>
            Configure Your Academic Cohort
          </h3>
          <p style={{ color: "#94A3B8", fontSize: "0.95rem", marginTop: "0.5rem", maxWidth: "34rem", lineHeight: 1.6 }}>
            Estimate lab infrastructure cost reduction, faculty grading time saved, and NAAC/NBA compliance readiness for your campus.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(34, 211, 238, 0.08)", padding: "0.5rem 1rem", borderRadius: "0.75rem", border: "1px solid rgba(34, 211, 238, 0.2)" }}>
          <span style={{ fontSize: "1.2rem" }}>🏛️</span>
          <span style={{ fontSize: "0.85rem", color: "#E2E8F0", fontWeight: 600 }}>NAAC Criteria 1 & 2 Aligned</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(20rem, 1fr))", gap: "2.5rem", alignItems: "center" }}>
        {/* Controls Column */}
        <div>
          {/* Student Cohort Slider */}
          <div style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <label htmlFor="student-slider" style={{ color: "#E2E8F0", fontSize: "0.95rem", fontWeight: 700 }}>
                Total Enrolled Students
              </label>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#22D3EE", background: "rgba(34, 211, 238, 0.1)", padding: "0.2rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(34, 211, 238, 0.3)" }}>
                {studentCount} students
              </span>
            </div>
            <input
              id="student-slider"
              type="range"
              min={50}
              max={3000}
              step={50}
              value={studentCount}
              onChange={(e) => setStudentCount(Number(e.target.value))}
              style={{
                width: "100%",
                height: "8px",
                borderRadius: "4px",
                accentColor: "#22D3EE",
                cursor: "pointer",
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: "0.75rem", marginTop: "0.4rem" }}>
              <span>50 (Single Batch)</span>
              <span>300 (Department)</span>
              <span>1,000 (Multi-Dept)</span>
              <span>3,000+ (Full Campus)</span>
            </div>
          </div>

          {/* Specialisation Tracks Multi-Select */}
          <div>
            <label style={{ color: "#E2E8F0", fontSize: "0.95rem", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>
              Select Degree & Placement Tracks ({selectedTracks.length} chosen)
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {TRACKS.map((t) => {
                const isSelected = selectedTracks.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTrack(t.id)}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "0.75rem",
                      border: isSelected ? "1px solid #22D3EE" : "1px solid rgba(255, 255, 255, 0.1)",
                      background: isSelected ? "rgba(34, 211, 238, 0.12)" : "rgba(15, 23, 42, 0.6)",
                      color: isSelected ? "#FFFFFF" : "#94A3B8",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: isSelected ? 700 : 500,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </span>
                    <span style={{ fontSize: "0.75rem", color: isSelected ? "#38BDF8" : "#64748B", background: "rgba(255,255,255,0.06)", padding: "0.15rem 0.5rem", borderRadius: "0.35rem" }}>
                      {t.aicte}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Impact Metrics Card */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(34, 211, 238, 0.15), rgba(99, 102, 241, 0.1))",
            borderRadius: "1.25rem",
            padding: "2rem",
            border: "1px solid rgba(34, 211, 238, 0.35)",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)", paddingBottom: "1.25rem" }}>
            <div style={{ color: "#94A3B8", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700, marginBottom: "0.25rem" }}>
              Annual Lab Infrastructure Saved
            </div>
            <div style={{ fontSize: "2.25rem", fontWeight: 900, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
              {formatLakhs(estimatedSavings)} <span style={{ fontSize: "1rem", color: "#10B981", fontWeight: 700 }}>(-60% vs Physical Labs)</span>
            </div>
            <div style={{ color: "#22D3EE", fontSize: "0.85rem", fontWeight: 600, marginTop: "0.25rem" }}>
              ⚡ In-browser zero-maintenance sandboxes — no high-end GPU workstations needed
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <div style={{ color: "#94A3B8", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>
                Faculty Grading Recaptured
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#818CF8", marginTop: "0.2rem" }}>
                {facultyHoursSaved.toLocaleString()} hrs / yr
              </div>
              <div style={{ color: "#64748B", fontSize: "0.75rem" }}>Automated code execution tests</div>
            </div>

            <div>
              <div style={{ color: "#94A3B8", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>
                Active Specialisation Labs
              </div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#10B981", marginTop: "0.2rem" }}>
                {selectedTracks.length * 35}+ Hands-on Labs
              </div>
              <div style={{ color: "#64748B", fontSize: "0.75rem" }}>Verified digital credentials</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              style={{
                flex: 1,
                minWidth: "12rem",
                padding: "0.85rem 1.25rem",
                borderRadius: "0.75rem",
                background: "linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)",
                border: "none",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 0 25px rgba(34, 211, 238, 0.4)",
                textAlign: "center",
              }}
            >
              🏛️ Book Free Campus Demo
            </button>
            <a
              href={`https://wa.me/917305771789?text=Hello%20Zentrion%2C%20I%20am%20interested%20in%20a%20campus%20demo%20for%20${studentCount}%20students.`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "0.85rem 1.25rem",
                borderRadius: "0.75rem",
                background: "rgba(37, 211, 102, 0.15)",
                border: "1px solid rgba(37, 211, 102, 0.4)",
                color: "#25D366",
                fontWeight: 700,
                fontSize: "0.95rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              💬 WhatsApp Dean Helpline
            </a>
          </div>
        </div>
      </div>

      {showDemoModal && (
        <CollegeDemoModal
          studentCount={studentCount}
          trackCount={selectedTracks.length}
          onClose={() => setShowDemoModal(false)}
        />
      )}
    </div>
  );
}

export function CollegeDemoModal({
  studentCount,
  trackCount,
  onClose,
}: {
  studentCount: number;
  trackCount: number;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [role, setRole] = useState<string>("HoD / Dean");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(3, 7, 18, 0.8)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "32rem",
          background: "linear-gradient(135deg, #0A0F1D 0%, #0F172A 100%)",
          borderRadius: "1.5rem",
          border: "1px solid rgba(34, 211, 238, 0.35)",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(34, 211, 238, 0.2)",
          padding: "2.5rem 2rem",
          color: "#FFFFFF",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "rgba(255, 255, 255, 0.1)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            color: "#CBD5E1",
            cursor: "pointer",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎓</div>
            <h4 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.5rem" }}>
              Campus Demo Scheduled!
            </h4>
            <p style={{ color: "#94A3B8", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Thank you, <strong style={{ color: "#F8FAFC" }}>{name}</strong>. Our Academic Partnerships Director will connect with you at <strong style={{ color: "#38BDF8" }}>{institution}</strong> to demonstrate sandbox lab provisioning and NAAC report generation for {studentCount} students.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #22D3EE, #6366F1)",
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "0.8rem", color: "#22D3EE", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.3rem" }}>
              Academic Partnership Programme
            </div>
            <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#FFFFFF", marginBottom: "0.5rem" }}>
              Book a Campus Lab Demo
            </h3>
            <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Free 90-day pilot cohort for accredited colleges with full curriculum mapping.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Your Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Prof. Ramesh Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Institution Email *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="ramesh@college.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                    Your Role / Title
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5rem",
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      color: "#FFFFFF",
                      fontSize: "0.9rem",
                      outline: "none",
                    }}
                  >
                    <option value="HoD / Dean">HoD / Dean</option>
                    <option value="Principal / Director">Principal / Director</option>
                    <option value="Training & Placement Officer">TPO / Placement Head</option>
                    <option value="Faculty / Professor">Faculty / Professor</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                  College / University Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. National Institute of Technology"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", color: "#CBD5E1", fontWeight: 600, marginBottom: "0.3rem" }}>
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    background: "rgba(15, 23, 42, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    color: "#FFFFFF",
                    fontSize: "0.9rem",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  marginTop: "0.5rem",
                  padding: "0.9rem",
                  borderRadius: "0.75rem",
                  background: "linear-gradient(135deg, #22D3EE, #6366F1)",
                  border: "none",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 0 25px rgba(34, 211, 238, 0.4)",
                }}
              >
                Schedule Free Campus Demo
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export function CollegeFaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const FAQS = [
    {
      q: "Does Zentrion map to AICTE, UGC, and NEP 2020 guidelines?",
      a: "Yes. All Zentrion tracks are aligned with the Model Curriculum guidelines from AICTE and NEP 2020 experiential learning mandates. We provide syllabi mapping documents for Board of Studies (BoS) approvals.",
    },
    {
      q: "What infrastructure does our institution need to deploy Zentrion?",
      a: "Zero servers or specialized hardware. All computing labs, AI GPU clusters, and cybersecurity drills run securely inside the browser via WebAssembly and sandboxed cloud containers. Any laptop with a modern web browser is sufficient.",
    },
    {
      q: "How does batch enrollment and cohort tracking work for 1,000+ students?",
      a: "Institutions can upload student lists in CSV format or sync via Google Classroom / Microsoft Teams. Students receive welcome invites with pre-assigned tracks, and faculty can track real-time coding progress and assignment pass rates.",
    },
    {
      q: "Can our faculty conduct live lectures and assign custom lab assignments?",
      a: "Yes. The Instructor Studio allows your professors to schedule interactive live coding sessions, author custom quizzes and programming challenges, and inspect automated submission test results.",
    },
    {
      q: "Are completion certificates recognized by hiring companies?",
      a: "Yes. Zentrion certificates feature cryptographic verification with unique QR codes, verifiable skills evidence, and are recognized by our network of over 150+ technology hiring partners.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "48rem", margin: "0 auto" }}>
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={faq.q}
            style={{
              borderRadius: "1rem",
              background: isOpen ? "rgba(15, 23, 42, 0.95)" : "rgba(10, 15, 29, 0.6)",
              border: isOpen ? "1px solid rgba(34, 211, 238, 0.35)" : "1px solid rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
              transition: "all 0.25s ease",
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                width: "100%",
                padding: "1.25rem 1.5rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "transparent",
                border: "none",
                color: "#FFFFFF",
                fontSize: "1.05rem",
                fontWeight: 700,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span>{faq.q}</span>
              <span style={{ fontSize: "1.25rem", color: isOpen ? "#22D3EE" : "#64748B", transition: "transform 0.2s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                ↓
              </span>
            </button>
            {isOpen && (
              <div style={{ padding: "0 1.5rem 1.25rem", color: "#94A3B8", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
