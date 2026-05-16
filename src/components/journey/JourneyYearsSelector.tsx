"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { generateJourneyYears } from "@/lib/utils/activity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JourneyYearsSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const JourneyYearsSelector = ({
  selectedYear,
  onYearChange,
}: JourneyYearsSelectorProps) => {
  const user = useAppSelector((state) => state.sync.user);

  if (!user?.createdAt) return null;

  const years = generateJourneyYears(user.createdAt);

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => onYearChange(parseInt(value))}
      >
        <SelectTrigger className="w-[120px] bg-background">
          <SelectValue placeholder={selectedYear.toString()} />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default JourneyYearsSelector;
