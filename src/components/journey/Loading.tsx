import { Skeleton } from "../ui/skeleton";

const Loading = () => {
  return (
    <div className="main-container pt-10 space-y-8">
      <Skeleton className="h-64 w-full rounded-3xl  bg-gray-100 dark:bg-secondary" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-48 rounded-2xl bg-gray-100 dark:bg-secondary" />
        <Skeleton className="h-48 md:col-span-2 rounded-2xl bg-gray-100 dark:bg-secondary" />
      </div>
      <Skeleton className="h-96 w-full rounded-2xl bg-gray-100 dark:bg-secondary" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="h-32 rounded-xl bg-gray-100 dark:bg-secondary"
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;
