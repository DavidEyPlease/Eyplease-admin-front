export const translateTaskActivityType = (activityType: string): string => {
    const translations: Record<string, string> = {
        comment: 'Ha comentado',
        request_correction: 'Solicito una corrección',
    }

    return translations[activityType] || '';
}