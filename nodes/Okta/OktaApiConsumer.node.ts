import { IExecuteFunctions } from 'n8n-core';
import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { oktaApiRequest } from './GenericFunctions';


export class OktaApiConsumer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Okta API call',
		name: 'oktaApiConsumer',
		//icon: 'file:okta.png',
		group: ['transform'],
		version: 1,
		description: 'Consumes the Okta API',
		defaults: {
			name: 'Okta API call',
			color: '#1f2957',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'oktaApiToken',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'HTTP method',
				name: 'httpMethod',
				type: 'options',
				options: [
					{ name: 'HTTP GET', value: 'GET' },
					{ name: 'HTTP POST', value: 'POST' },
					{ name: 'HTTP DELETE', value: 'DELETE' },
					{ name: 'HTTP PUT', value: 'PUT' },
				],
				default: 'POST',
			},
			{
				displayName: 'API path',
				name: 'apiPath',
				type: 'string',
				default: 'users',
			},
			{
				displayName: 'Check for changes',
				name: 'checkForChanges',
				type: 'boolean',
				default: false,
				description:
					'If enabled with POST/PUT it will perform an ' +
					'additional GET call before and only update ' +
					'when anything actually has changed.'
			},
			{
				displayName: 'Disable "id" logic',
				name: 'disableIdLogic',
				type: 'boolean',
				default: false,
				description:
					'Normally if the input object has an "id" field the path ' +
					'used will implicitly change to /api/v1/$PATH/$ID and ' +
					'the remaining object (without "id" field) is being sent. ' +
					'If enabled the node will use the path as given and send ' +
					'the object as-is.'
			},
			{
				displayName: 'Query options',
				name: 'queryOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: {
						httpMethod: ['GET'],
					},
				},
				options: [
					{
						displayName: 'q',
						name: 'q',
						type: 'string',
						default: '',
					},
					{
						displayName: 'filter',
						name: 'filter',
						type: 'string',
						default: '',
					},
					{
						displayName: 'search',
						name: 'search',
						type: 'string',
						default: '',
					},
					{
						displayName: 'since',
						name: 'since',
						type: 'string',
						default: '',
					},
					{
						displayName: 'until',
						name: 'until',
						type: 'string',
						default: '',
					},
					{
						displayName: 'expand',
						name: 'expand',
						type: 'string',
						default: '',
					},
					{
						displayName: 'after',
						name: 'after',
						type: 'string',
						default: '',
					},
					{
						displayName: 'limit',
						name: 'limit',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'sortOrder',
						name: 'sortOrder',
						type: 'string',
						default: '',
					},
					{
						displayName: 'provider',
						name: 'provider',
						type: 'string',
						default: '',
					},
				],
			},
			{
				displayName: 'Query options',
				name: 'queryOptions',
				type: 'collection',
				placeholder: 'Add option',
				default: {},
				displayOptions: {
					show: {
						httpMethod: ['POST'],
						apiPath: ['users'],
					},
				},
				options: [
					{
						displayName: 'activate',
						name: 'activate',
						type: 'string',
						default: '',
					},
					{
						displayName: 'nextLogin',
						name: 'nextLogin',
						type: 'string',
						default: '',
					},
				],
			},
		]
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

		// get input data
		const items = this.getInputData();
		const length = items.length;

		console.log("\n# of items: ", length);


		// check for method and add query parameters
		const httpMethod = this.getNodeParameter('httpMethod', 0) as string;
		const checkForChanges = this.getNodeParameter('checkForChanges', 0) as boolean;
		const disableIdLogic = this.getNodeParameter('disableIdLogic', 0) as boolean;

		// return array
		let rv: IDataObject[] = [];

		// iterate over input elements
		for (let i = 0; i < length; i++) {
			console.log(`-- working item ${i} --`);
			// we only process json data, not binary data.
			if (!("json" in items[i])) { continue; }

			const item = items[i]["json"];
			console.log(item);

			const apiPath = this.getNodeParameter('apiPath', i) as string;
			const qs: IDataObject = (httpMethod == 'GET')
				? this.getNodeParameter('queryOptions', i) as IDataObject
				: {};

			let useApiPath: string = apiPath;
			let body: IDataObject = {}

			if (!disableIdLogic && item && "id" in item) {
				useApiPath = `${apiPath}/${item["id"]}`;
				delete item["id"];
				if (
					item && Object.keys(item).length > 0 &&
					(httpMethod == "POST" || httpMethod == "PUT")
				) {
					body = item;
				}
			} else if (httpMethod == "POST" || httpMethod == "PUT") {
				body = item;
			}

			// TODO ...
			if (httpMethod == 'POST' && checkForChanges) {
				console.log("NOT IMPLEMENTED - OktaApiCall/checkForChanges");
			}

			console.log('httpMethod:        ', httpMethod);
			console.log('checkForChanges:   ', checkForChanges);
			console.log('disableIdLogic:    ', disableIdLogic);
			console.log('queryOptions:      ', qs);
			console.log('apiPath:           ', apiPath);

			let rsp: IDataObject[];
			rsp = await oktaApiRequest.call(
				this,
				httpMethod,
				useApiPath,
				body,
				qs
			);

			// oktaApiRequest() will *always* return an array.
			rv.push(...rsp);
		}

		return [this.helpers.returnJsonArray(rv)];
	}

}
