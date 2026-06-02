import { ageGroupSchema } from "@hygieiashield/zod-contracts";

const AgeGroupEnum = Object.fromEntries(
    ageGroupSchema.options.map((ageGroup) => [ageGroup, ageGroup])
);

const AGE_GROUP_METADATA = {
    NEONATE: {
        label: "Newborn",
        range: "0 - 28 days",
    },
    PEDIATRIC: {
        label: "Child",
        range: "1 mon - 12 years",
    },
    ADULT: {
        label: "Adult",
        range: "12 - 64 years",
    },
    GERIATRIC: {
        label: "Senior",
        range: "65+ years",
    },
};

export default function AgeSelector({ label = "Approximate Age", value, onChange }) {
    return (
        <div className="w-full">
            <label
                className="
                    block
                    mb-1.5
                    text-[12px]
                    font-medium
                    text-slate-600
                "
            >
                {label}
                <span className="ml-1 text-red-500" aria-label="required">*</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
                {Object.values(AgeGroupEnum).map((ageGroup) => {
                    const meta = AGE_GROUP_METADATA[ageGroup] || {
                        label: ageGroup,
                        range: "",
                    };
                    const isSelected = value === ageGroup;

                    return (
                        <button
                            key={ageGroup}
                            type="button"
                            onClick={() => onChange(ageGroup)}
                            aria-pressed={isSelected}
                            aria-label={`${meta.label}, ${meta.range}`}
                            className={`
                        group
                        flex
                        flex-col
                        items-start
                        justify-center

                        min-h-22
                        w-full

                        rounded-2xl
                        border

                        px-4
                        py-4

                        text-left

                        transition-all
                        duration-200

                        focus:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-sky-300

                        ${isSelected
                                    ? `
                            border-sky-400
                            bg-sky-50
                            shadow-sm
                            `
                                    : `
                            border-slate-200
                            bg-white
                            hover:border-slate-300
                            `
                                }
                        `}
                        >
                            <span className="flex flex-col gap-1 text-left">
                                <span className="text-[15px] font-semibold leading-tight text-slate-700 dark:text-slate-100">
                                    {meta.label}
                                </span>
                                <span className="mt-1 text-xs text-slate-600">
                                    {meta.range}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>

    );
}
