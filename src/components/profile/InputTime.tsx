"use client";

import { Input } from "../ui/input";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface InputTimeProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
}

function roundTo15Minutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);

  const rounded = Math.round(minutes / 15) * 15;

  const date = new Date();

  date.setHours(hours);
  date.setMinutes(rounded);

  return date.toTimeString().slice(0, 5);
}

const InputTime = ({ id, value, onChange }: InputTimeProps) => {
  const t = useTranslations("ProfilePage");
  return (
    <Input
      id={id}
      type="time"
      value={value}
      step={900} // 15 minutes
      onChange={(event) => {
        onChange(event.target.value);
      }}
      className="h-11 rounded-xl"
      onBlur={(event) => {
        const original = event.target.value;
        const minutes = Number(original.split(":")[1] ?? 0);
        if (minutes % 15 !== 0) {
          const roundedValue = roundTo15Minutes(original);
          toast.error(t("validation.timeRounded"));
          onChange(roundedValue);
          return;
        }
        onChange(original);
      }}
    />
  )
};

export default InputTime;
