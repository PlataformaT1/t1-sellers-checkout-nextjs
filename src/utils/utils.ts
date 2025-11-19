export const numberFormat = (value: number | string): string => {
    let numericValue: number;

    if (typeof value === 'string') {
        numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    } else if (typeof value === 'number') {
        numericValue = value;
    } else {
        return value;
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
};