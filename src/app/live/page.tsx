import { Metadata } from "next";
import { LiveClassroom } from "./live-classroom";

export const metadata: Metadata = {
  title: "Live Class Studio — Zentrion Learntech",
  description: "Interactive real-time live masterclasses with industry instructors, live code execution, and peer discussion.",
};

export default function LiveClassPage() {
  return <LiveClassroom />;
}
