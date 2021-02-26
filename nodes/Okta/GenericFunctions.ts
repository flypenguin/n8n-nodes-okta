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


export async function oktaApiRequestOne(
    this: IPollFunctions | IExecuteFunctions,
    method: string,
    path: string,
    body: any = {},
    qs: IDataObject = {},
    uri?: string | undefined,
    option = {}
): Promise<any> {

    const credentials = this.getCredentials('oktaApiToken') as IDataObject;

    try {
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

        if (Object.keys(body).length === 0) {
            delete options.body;
        }
        if (Object.keys(option).length !== 0) {
            Object.assign(options, option);
        }

        return this.helpers.request(options);

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


export async function oktaApiRequest(
    this: IPollFunctions | IExecuteFunctions,
    method: string,
    path: string,
    body: any = {},
    qs: IDataObject = {},
    uri?: string | undefined,
    option = {}
): Promise<any[]> {

    let rv: any[] = [];
    let link;

    do {
        // we need the "resolveWithFullResponse" parameter. no headers, no links otherwise.
        let rsp = await oktaApiRequestOne.call(this, method, path, body, qs, uri, { resolveWithFullResponse: true });
        uri = getNext(rsp.headers.link);

        let responseBody: any = rsp.body;
        if (responseBody !== null && responseBody !== undefined) {
            // careful - an array IS ALSO an object, so check this 1st!
            if (Array.isArray(responseBody)) {
                rv.push(...responseBody);
            } else if (typeof responseBody === 'object') {
                rv.push(responseBody);
            } else {
                throw new Error(
                    `Okta API: unexpected return value: ${rsp}`
                );
            }
        }

    } while (
        uri !== undefined
    );

    // will ALWAYS return an array, just to be predictable
    return rv;
}


// kinda stolen from here: https://git.io/Jtb5c
function getNext(link: string): string | undefined {
    if (link === undefined) {
        return;
    }
    for (const rel of link.split(',')) {
        if (rel.includes('rel="next"')) {
            return rel.split(';')[0].replace('<', '').replace('>', '').trim();
        }
    }
    return undefined;
}
