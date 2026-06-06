
export function getExtensionValue(extensions = [], url) {
    return extensions.find(ext => ext.url === url)?.valueString;
}

export function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}