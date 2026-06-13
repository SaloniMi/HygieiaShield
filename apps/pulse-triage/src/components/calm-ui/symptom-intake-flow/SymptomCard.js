export default function SymptomCard({
    icon: Icon,
    label,
    selected,
    onClick,
    activeSubCount = 0
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
            p-5 
            text-left
            relative
            rounded-3xl
            border
            justify-between 
            h-32

            flex
            flex-col
            gap-3

            transition-all

            ${selected
                    ? `
                border-[#4B9BFF]
                bg-[#EAF3FF]
                `
                    : `
                border-slate-300
                bg-white
                `
                }
        `}
        >
            <div className="flex justify-between items-start w-full">
                <Icon
                    size={28}
                    className={
                        selected
                            ? "text-[#1B65B0]"
                            : "text-[#6A6A6A]"
                    }
                />
                {/* PERSISTENT SUB-OBSERVABLE BADGE */}
                {activeSubCount > 0 && (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 animate-fadeIn">
                        +{activeSubCount} Alert{activeSubCount > 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <span
                className={`
          text-[15px]
          leading-5
          font-medium

          ${selected
                        ? "text-[#0A4F96]"
                        : "text-[#555]"
                    }
        `}
            >
                {label}
            </span>
        </button>
    );
}