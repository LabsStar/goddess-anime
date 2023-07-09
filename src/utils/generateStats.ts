export default function generateStats() {
    let stats: { [key: string]: number } = {
        health: 100,
        attack: 0,
        defense: 0,
        mana: 0,
        speed: 0,
        luck: 0,
    }


    for (let [key, value] of Object.entries(stats as any)) {
        // Generate a random number between 1 and 100
        const random = Math.floor(Math.random() * 100) + 1;

        // Set the value of the key to the random number
        if (key === 'health') stats[key] = 100;
        else stats[key] = random;
    }

    return stats;
}