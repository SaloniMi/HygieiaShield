import Input from "@/components/web-components/Input";

export default function PatientNameField({
    value,
    onChange,
    error,
}) {
    return (
        <Input
            id="patient-first-name"
            label="Patient's first name"
            placeholder="e.g. James"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            autoComplete="given-name"
            maxLength={50}
            error={error}
            required
        />
    );
}