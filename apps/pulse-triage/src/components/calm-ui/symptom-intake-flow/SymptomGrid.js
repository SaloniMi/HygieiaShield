import React from "react";
import {
    Activity,         // For Stroke/Neurological signs
    AlertTriangle,    // For Altered Mental Status/Unresponsive states
    Bone,             // For generic severe orthopedic injuries
    ActivitySquare,   // For Chest discomfort/Pain
    FlameKindling,    // For Fever/Infection tracking
    HeartHandshake,   // For Safety, Crisis & Support
    Wind,            // For Breathing trouble/Struggles
    ShieldAlert,      // For Severe allergic reactions/Anaphylaxis
    Spline,           // For severe internal/Stomach pain profiles
    Stethoscope,      // For minor primary care/Outpatient items
} from "lucide-react";
import SymptomCard from "./SymptomCard";


/**
 * High-Calm Simplified User Taxonomy
 * Groups 30+ complex code structures into 10 obvious visual items.
 */
const SIMPLIFIED_SYMPTOMS = [
    {
        id: "BREATHING_TROUBLE",
        label: "Trouble Breathing / Gasping",
        icon: Wind,
    },
    {
        id: "CHEST_PAIN",
        label: "Chest Pain, Pressure or Tightness",
        icon: ActivitySquare,
    },
    {
        id: "STROKE_SIGNS",
        label: "Sudden Weakness or Slurred Speech",
        icon: Stethoscope,
    },
    {
        id: "ALTERED_CONSCIOUSNESS",
        label: "Unresponsive or Suddenly Confused",
        icon: AlertTriangle,
    },
    {
        id: "SEVERE_HEADACHE",
        label: "Sudden, Unbearable Headache",
        icon: Activity, // Re-uses clean neurological activity
    },
    {
        id: "TRAUMA_INJURY",
        label: "Severe Cut, Fall or Bleeding",
        icon: Bone,
    },
    {
        id: "FEVER_INFECTION",
        label: "High Fever or Chills",
        icon: FlameKindling,
    },
    {
        id: "STOMACH_PAIN",
        label: "Severe Stomach Ache or Abdominal Pain",
        icon: Spline,
    },
    {
        id: "ALLERGIC_REACTION",
        label: "Severe Allergic Reaction / Swelling",
        icon: ShieldAlert,
    },
    {
        id: "CRISIS_AND_SAFETY",
        label: "Mental Health Crisis or Personal Safety Concerns",
        icon: HeartHandshake,
    },
];


export default function SymptomGrid({
    value = [],
    onChange,
}) {
    const toggle = (id) => {
        if (value.includes(id)) {
            onChange(value.filter((item) => item !== id));
        } else {
            onChange([...value, id]);
        }
    };


    return (
        <div className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
                {SIMPLIFIED_SYMPTOMS.map((symptom) => (
                    <SymptomCard
                        key={symptom.id}
                        icon={symptom.icon}
                        label={symptom.label}
                        selected={value.includes(symptom.id)}
                        onClick={() => toggle(symptom.id)}
                    />
                ))}
            </div>
        </div>
    );
}



