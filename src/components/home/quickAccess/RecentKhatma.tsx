
import { getKhatmaPlan } from "@/server/db/khatmaPlan";
import { getSession } from "@/lib/oauth/auth";
import KhatmaCardClient from "./KhatmaCardClient";

const RecentKhatma = async () => {
  const session = await getSession();

  // Only fetch if authenticated
  if (!session?.id) return null;

  const khatma = await getKhatmaPlan(session.id);
  // No active plan — render nothing so the grid fills gracefully
  if (!khatma || khatma.isCompleted) return null;

  return <KhatmaCardClient plan={khatma} />;
};

export default RecentKhatma;
