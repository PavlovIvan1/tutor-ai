import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** daisyUI `toggle`. */
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "checked"> {
  onCheckedChange?: (v: boolean) => void;
  checked?: boolean;
}

export function Checkbox({ className, onCheckedChange, checked, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={cn("toggle toggle-sm", className)}
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      {...props}
    />
  );
}

/** daisyUI `range`. */
interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number[]; // совместимо со входом shadcn [value]
  onValueChange: (v: number[]) => void;
  className?: string;
}

export function Slider({ min = 0, max = 10, step = 1, value, onValueChange, className }: SliderProps) {
  const v = value[0] ?? 0;
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange([Number(e.target.value)])}
      className={cn("range range-sm range-primary", className)}
    />
  );
}

/** daisyUI `select select-bordered select-sm`. */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => (
    <select ref={ref} className={cn("select select-bordered select-sm w-full", className)} {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
);
Select.displayName = "Select";

export const Input = ({ className, type, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input type={type} className={cn("input input-bordered input-sm w-full", className)} {...props} />
);

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn("label-text text-sm font-medium", className)} {...props} />
);
