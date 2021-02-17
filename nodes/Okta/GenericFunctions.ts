import {
    OptionsWithUri,
} from 'request';

import {
    IExecuteFunctions,
} from 'n8n-core';

import {
    IDataObject,
    IPollFunctions,
} from 'n8n-workflow';


export async function oktaApiRequest(
    this: IPollFunctions | IExecuteFunctions,
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
        process.stdout.write("\nCALLING OKTA ... ");
        console.log(options);
        console.log("*** body:***");
        console.log(body);
        let rsp = await this.helpers.request!(options) || {};
        if (Array.isArray(rsp)) {
            console.log("result length " + rsp.length + "\n");
            return rsp;
        } else if (rsp == null) {
            console.log("null returned");
            return [];
        } else if (typeof rsp === 'object') {
            console.log("single object returned");
            return [rsp];
        } else {
            console.log("something weird returned:");
            console.log(rsp);
            return [];
        }
    } catch (error) {
        if (error.response && error.response.body && error.response.body.error) {
            console.log("ERROR: ", error)
            const message = error.response.body.error;

            // Try to return the error prettier
            throw new Error(
                `Okta API error response [${error.statusCode}]: ${message}`,
            );
        }
        throw error;
    }
}
