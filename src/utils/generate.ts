export function generateCardId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function getCurrentDate() {
    const date = new Date();

    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

export function formatNumber(number: number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}