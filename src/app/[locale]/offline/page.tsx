import OfflineExperience from "./_components/OfflineExperience";

export function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}
export default function OfflinePage() {
  return <OfflineExperience />;
}
