import React, { useState } from "react";
import {
    Activity,         // For Stroke/Neurological signs
    AlertTriangle,    // For Altered Mental Status/Unresponsive states
    Bone,             // For generic severe orthopedic injuries
    ActivitySquare,   // For Chest discomfort/Pain
    FlameKindling,    // For Fever/Infection tracking
    HeartHandshake,   // For Safety, Crisis & Support
    Wind,             // For Breathing trouble/Struggles
    ShieldAlert,      // For Severe allergic reactions/Anaphylaxis
    Spline,           // For severe internal/Stomach pain profiles
    Stethoscope,      // For minor primary care/Outpatient items
} from "lucide-react";
import SymptomCard from "./SymptomCard";

const SIMPLIFIED_SYMPTOMS = [
    { id: "BREATHING_TROUBLE", label: "Breathing & Respiration", icon: Wind },
    { id: "CHEST_PAIN", label: "Chest & Heart", icon: ActivitySquare },
    { id: "STROKE_SIGNS", label: "Neurological / Face & Limbs", icon: Stethoscope },
    { id: "ALTERED_CONSCIOUSNESS", label: "Alertness & Confusion", icon: AlertTriangle },
    { id: "SEVERE_HEADACHE", label: "Head Pain", icon: Activity },
    { id: "TRAUMA_INJURY", label: "Injuries, Falls & Bleeding", icon: Bone },
    { id: "FEVER_INFECTION", label: "Fever & Chills", icon: FlameKindling },
    { id: "STOMACH_PAIN", label: "Stomach & Abdominal Pain", icon: Spline },
    { id: "ALLERGIC_REACTION", label: "Allergic Reactions & Swelling", icon: ShieldAlert },
    { id: "CRISIS_AND_SAFETY", label: "Mental Health & Personal Safety", icon: HeartHandshake }
];

const SUB_OBSERVABLES_MAP = {
    BREATHING_TROUBLE: [
        { id: "Gasping or struggling for air", label: "Gasping or struggling for air" },
        { id: "Throat closing / Squeaking breath", label: "Throat closing / Squeaking breath" },
        { id: "Child: Grunting or belly breathing", label: "Child: Grunting or belly breathing" }
    ],
    CHEST_PAIN: [
        { id: "Crushing chest pain / Pressure spreading to arm", label: "Crushing chest pain / Pressure spreading to arm" }
    ],
    STROKE_SIGNS: [
        { id: "Face droop, slurred speech, or limp arm/leg", label: "Face droop, slurred speech, or limp arm/leg" }
    ],
    ALTERED_CONSCIOUSNESS: [
        { id: "Passed out / Completely unresponsive", label: "Passed out / Completely unresponsive" },
        { id: "Sudden confusion or severe disorientation", label: "Sudden confusion or severe disorientation" }
    ],
    SEVERE_HEADACHE: [
        { id: "Sudden, worst headache of life", label: "Sudden, worst headache of life" },
        { id: "Headache combined with an extremely stiff neck", label: "Headache combined with an extremely stiff neck" }
    ],
    TRAUMA_INJURY: [
        { id: "Deep puncture, cut, or wound to neck, chest, or belly", label: "Deep puncture, cut, or wound to neck, chest, or belly" },
        { id: "Fell from a significant height (20+ feet)", label: "Fell from a significant height (20+ feet)" },
        { id: "Injured arm or leg is blue, cold, or missing a pulse", label: "Injured arm or leg is blue, cold, or missing a pulse" }
    ],
    FEVER_INFECTION: [
        { id: "Infant under 28 days old with any fever", label: "Infant under 28 days old with any fever" },
        { id: "Patient is an organ transplant recipient or oncology patient", label: "Patient is an organ transplant recipient or oncology patient" }
    ],
    STOMACH_PAIN: [
        { id: "Severe lower belly pain + Is currently pregnant", label: "Severe lower belly pain + Is currently pregnant" },
        { id: "Sudden, severe testicular or scrotal pain", label: "Sudden, severe testicular or scrotal pain" }
    ],
    ALLERGIC_REACTION: [
        { id: "Swollen tongue or throat accompanied by wheezing", label: "Swollen tongue or throat accompanied by wheezing" }
    ],
    CRISIS_AND_SAFETY: [
        { id: "Immediate thoughts of self-harm or suicide", label: "Immediate thoughts of self-harm or suicide" },
        { id: "Unsafe environment / Domestic abuse situation", label: "Unsafe environment / Domestic abuse situation" }
    ]
};

export default function SymptomGrid({ value = [], onChange }) {
    const [activeCategory, setActiveCategory] = useState(null);

    const handleCategoryToggle = (categoryId) => {
        if (value.includes(categoryId)) {
            const subTokens = SUB_OBSERVABLES_MAP[categoryId]?.map(sub => sub.id) || [];
            onChange(value.filter(item => item !== categoryId && !subTokens.includes(item)));
            if (activeCategory === categoryId) {
                setActiveCategory(null);
            }
        } else {
            onChange([...value, categoryId]);
            setActiveCategory(categoryId);
        }
    };

    const handleSubObservableToggle = (subObservableId) => {
        if (value.includes(subObservableId)) {
            onChange(value.filter(item => item !== subObservableId));
        } else {
            onChange([...value, subObservableId]);
        }
    };

    // Helper to extract how many sub-items are selected for a category
    const getActiveSubCount = (categoryId) => {
        const subTokens = SUB_OBSERVABLES_MAP[categoryId]?.map(sub => sub.id) || [];
        return value.filter(item => subTokens.includes(item)).length;
    };

    // Group items by pairs (rows of 2) to insert inline panel context correctly
    const rows = [];
    for (let i = 0; i < SIMPLIFIED_SYMPTOMS.length; i += 2) {
        rows.push(SIMPLIFIED_SYMPTOMS.slice(i, i + 2));
    }

    return (
        <div className="space-y-4">
            {rows.map((row, rowIndex) => {
                // Determine if the currently active subcategory pane belongs to this row block
                const hasActiveCategoryInRow = row.some(symptom => symptom.id === activeCategory);

                return (
                    <div key={rowIndex} className="space-y-4">
                        {/* THE 2-COLUMN GRID ROW */}
                        <div className="grid grid-cols-2 gap-4">
                            {row.map((symptom) => {
                                const Icon = symptom.icon;
                                const isSelected = value.includes(symptom.id);
                                const activeSubCount = getActiveSubCount(symptom.id);

                                return (
                                    <SymptomCard
                                        key={symptom.id}
                                        icon={symptom.icon}
                                        label={symptom.label}
                                        selected={value.includes(symptom.id)}
                                        onClick={() => handleCategoryToggle(symptom.id)}
                                        activeSubCount={activeSubCount}
                                    />
                                );
                            })}
                        </div>

                        {/* INLINE CONTEXTUAL DANGER SIGN SUB-PANEL */}
                        {hasActiveCategoryInRow && SUB_OBSERVABLES_MAP[activeCategory] && (
                            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 base-animation animate-fadeIn space-y-3 w-full">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Are any of these specific danger signs present? (Optional)
                                </p>
                                <div className="flex flex-col gap-2">
                                    {SUB_OBSERVABLES_MAP[activeCategory].map((sub) => {
                                        const isSubSelected = value.includes(sub.id);
                                        return (
                                            <button
                                                key={sub.id}
                                                onClick={() => handleSubObservableToggle(sub.id)}
                                                className={`w-full p-3.5 rounded-xl border text-left text-sm transition-all flex items-center justify-between ${isSubSelected
                                                    ? "bg-amber-50/60 border-amber-400 text-amber-900 font-bold shadow-sm"
                                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                                                    }`}
                                            >
                                                <span className="leading-relaxed">{sub.label}</span>
                                                {isSubSelected && (
                                                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500 flex-shrink-0 ml-3" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}