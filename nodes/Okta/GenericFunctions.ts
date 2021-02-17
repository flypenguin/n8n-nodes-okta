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
        let rsp = await this.helpers.request!(options) || {};

        // return the right things
        if (Array.isArray(rsp)) {
            return rsp;
        } else if (rsp == null) {
            return [];
        } else if (typeof rsp === 'object') {
            return [rsp];
        } else {
            throw new Error(
                `Okta API: unexpected return value: ${rsp}`
            );
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
