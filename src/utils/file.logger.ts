import * as fs from "fs";

type ConsoleMethod = 'log' | 'error' | 'warn';

class ConsoleLogger {
    private logStream: fs.WriteStream;
    private originalConsoleMethods: { [key in ConsoleMethod]: (...args: any[]) => void}

    constructor(logFilePath: string) {
        this.logStream = fs.createWriteStream(logFilePath);

        this.originalConsoleMethods = {
            log: console.log,
            error: console.error,
            warn: console.warn
        }
    }

    public startLogging() {
       console.log = (...args: any[]) => this.log('log', args);
       console.error = (...args: any[]) => this.log('error', args);
       console.warn = (...args: any[]) => this.log('warn', args);
    }

    public stopLogging() {
       console.log = this.originalConsoleMethods.log;
       console.error = this.originalConsoleMethods.error;
       console.warn = this.originalConsoleMethods.warn;
    }


    private log(method: ConsoleMethod, args: any[]) {
        const logMsg = args.map(arg => String(arg)).join(' ');

        this.logStream.write(`[${method.toUpperCase()}] ${logMsg}\n`);


        this.originalConsoleMethods[method](...args);
    }
}


export default ConsoleLogger;