"use client";
import dynamic from "next/dynamic";

const OfflineExperience = dynamic(
  () => import("./_components/OfflineExperience"),
  {
    ssr: false,
  },
);

export default function OfflinePage() {
  return <OfflineExperience />;
}
