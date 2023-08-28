function getTimeOfDay(): string {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    let timeOfDay: string;

    if (currentHour >= 5 && currentHour < 12) {
        timeOfDay = 'pagi';
    } else if (currentHour >= 12 && currentHour < 15) {
        timeOfDay = 'siang';
    } else if (currentHour >= 15 && currentHour < 20) {
        timeOfDay = 'sore';
    } else {
        timeOfDay = 'malam';
    }

    return timeOfDay;
}

export default getTimeOfDay
