export default function SymptomCard({
    icon: Icon,
    label,
    selected,
    onClick,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
        h-28
        rounded-3xl
        border

        flex
        flex-col
        items-center
        justify-center
        gap-3

        px-4
        text-center

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
            <Icon
                size={28}
                className={
                    selected
                        ? "text-[#1B65B0]"
                        : "text-[#6A6A6A]"
                }
            />

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