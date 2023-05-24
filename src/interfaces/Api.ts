/**
 * @interface Api
 *! This is not used in the project currently. However I do plan to use it in the future. - @0xhylia
 */


interface Api {
    name: string;   
    description: string;
    version: string;


    routes: {
        name: string;
        description: string;
        path: string;
        method: string;
        auth: boolean;
        params: {
            name: string;
            description: string;
            required: boolean;
        }[];
        body: {
            name: string;
            description: string;
            required: boolean;
        }[];

        filePath: string;
    }[];
}

export default Api;
