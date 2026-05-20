import ReflectionContainer from "@/components/reflection/ReflectionContainer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "رفيق التأمل بالذكاء الاصطناعي",
  description:
    "تواصل مع القرآن على مستوى عاطفي وروحاني اعتمادًا على مشاعرك الحالية.",
};

export default function ReflectionPage() {
  return (
    <main className="relative overflow-hidden min-h-screen py-10 ">
      {/* Ambient background elements */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-primary/20 blur-[120px]" />

        <div className="absolute right-[10%] top-[40%] h-96 w-96 rounded-full bg-purple-500/10 blur-[120px]" />

        <div className="absolute bottom-[10%] left-[20%] h-64 w-64 rounded-full bg-blue-500/10 blur-[120px]" />
      </div>
      <div className="main-container">
        <ReflectionContainer />
      </div>
    </main>
  );
}
