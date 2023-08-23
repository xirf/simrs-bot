export interface CardData {
    nama?: string;
    tgl?: string;
    jam?: string;
    poli?: string;
}

export default function cardParser(text: string, data: CardData | object): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
        return data[ placeholder ] || match;
    });
}
