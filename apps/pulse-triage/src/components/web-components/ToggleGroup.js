import Button from './Button';

export default function ToggleGroup({ options, value, onChange, className = '' }) {
    return (
        <div role="group" className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${className}`}>
            {options.map((option) => {
                const isSelected = value === option.value;
                const selectedVariant = option.tone === 'danger' ? 'danger' : option.tone === 'secondary' ? 'secondary' : 'primary';

                return (
                    <Button
                        key={option.value}
                        type="button"
                        variant={isSelected ? selectedVariant : 'outline'}
                        size="md"
                        onClick={() => onChange(option.value)}
                        aria-pressed={isSelected}
                        className="min-h-13 whitespace-normal text-center"
                    >
                        {option.label}
                    </Button>
                );
            })}
        </div>
    );
}
