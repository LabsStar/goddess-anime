export function setEnv(key: string, value: string) {
    process.env[key] = value;
}

export function getEnv(key: string) {
    return process.env[key];
}

export function getEnvOrThrow(key: string) {
    const value = getEnv(key);
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}

//? I don't know why I did this... It's not like I'm going to change the env variables at runtime