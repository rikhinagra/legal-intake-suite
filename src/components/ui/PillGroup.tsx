interface PillOption {
  value: string;
  label: string;
}

interface PillGroupProps {
  name: string;
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function PillGroup({ name, options, value, onChange }: PillGroupProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const id = `${name}-${opt.value}`;
        const checked = value === opt.value;
        return (
          <div key={opt.value} className="relative">
            <input
              type="radio"
              name={name}
              id={id}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
              className="pointer-events-none absolute opacity-0"
            />
            <label
              htmlFor={id}
              className={`inline-flex cursor-pointer items-center rounded-full border-[1.5px] px-[18px] py-2.5 text-[13.5px] font-medium transition-all ${
                checked
                  ? "border-blue bg-blue text-white"
                  : "border-line bg-[#fcfdff] text-charcoal hover:border-blue/50"
              }`}
            >
              {opt.label}
            </label>
          </div>
        );
      })}
    </div>
  );
}
