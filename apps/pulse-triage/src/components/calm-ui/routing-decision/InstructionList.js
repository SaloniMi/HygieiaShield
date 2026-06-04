export default function InstructionList({ items = [] }) {
    if (!items.length) return null;

    return (
        <div>

            <div className="space-y-3">
                {items.map((item, idx) => (
                    <div
                        key={idx}
                        className="border border-slate-200 rounded-2xl bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3 text-slate-700">

                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800">
                                {idx + 1}
                            </span>

                            <p className="text-[15px] leading-5 font-medium text-[#555]">
                                {item}
                            </p>

                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}