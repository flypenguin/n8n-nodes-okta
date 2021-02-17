import {
    OptionsWithUri,
} from 'request';

import {
    IExecuteFunctions,
    ILoadOptionsFunctions,
} from 'n8n-core';

import {
    IDataObject,
    IPollFunctions,
} from 'n8n-workflow';


export async function oktaApiRequest(
    this: IPollFunctions,
    method: string, path: string, body: any = {}, qs: IDataObject = {}, uri?: string | undefined, option = {}
): Promise<any> {

    const credentials = this.getCredentials('oktaApiToken') as IDataObject;

    const options: OptionsWithUri = {
        headers: {
            'Authorization': "SSWS " + credentials.token,
        },
        method,
        body,
        qs,
        uri: uri || `https://${credentials.fqdn}/api/v1/${path}`,
        json: true,
    };

    try {
        if (Object.keys(body).length === 0) {
            delete options.body;
        }
        if (Object.keys(option).length !== 0) {
            Object.assign(options, option);
        }

        //@ts-ignore
        console.log(options);
        process.stdout.write("EXECUTE ... ");
        let rsp = await this.helpers.request!(options) || {};
        console.log("result length " + rsp.length);
        return rsp;
    } catch (error) {
        if (error.response && error.response.body && error.response.body.error) {

            const message = error.response.body.error;

            // Try to return the error prettier
            throw new Error(
                `Pushcut error response [${error.statusCode}]: ${message}`,
            );
        }
        throw error;
    }
}
