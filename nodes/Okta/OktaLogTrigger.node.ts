import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IPollFunctions,
} from 'n8n-workflow';

import {
	oktaApiRequest,
} from './GenericFunctions';


export class OktaLogTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Okta Log Trigger',
		name: 'oktaLogTrigger',
		//icon: 'file:okta.png',
		group: ['trigger'],
		version: 1,
		description: 'Pulls logs from Okta and pushes them one by one to downstream nodes.',
		defaults: {
			name: 'Okta Log Trigger',
			color: '#1f2957',
		},
		inputs: [],
		outputs: ['main'],
		polling: true,
		credentials: [
			{
				name: 'oktaApiToken',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Filter expression',
				name: 'filterExpression',
				type: 'string',
				required: false,
				default: '',
			},
			{
				displayName: '"q" expression',
				name: 'qExpression',
				type: 'string',
				required: false,
				default: '',
			},
		]
	};

	// see for existing example: pushcut trigger (webhook), https://git.io/JtwW0
	// see for existing example: toggl trigger (polling), https://git.io/Jt14w
	// see for existing example: clockify trigger (polling), https://git.io/Jt1E7
	// see for some explanations: https://community.n8n.io/t/basic-example-for-http-trigger-node/4145/5
	// workflow for developing nodes: https://is.gd/KY9DB5

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const webhookData = this.getWorkflowStaticData('node');
		const credential = this.getCredentials('oktaApiToken');
		const filterExpression = this.getNodeParameter('filterExpression') as string;
		const qExpression = this.getNodeParameter('qExpression') as string;

		if (credential == null) {
			// get rid of annoying TS check ;)
			return null;
		}
		const fqdn = credential.fqdn;
		const token = credential.token;

		let startDate = webhookData.lastTimeChecked;
		let endDate = new Date(Date.now() - 1000).toISOString().slice(0, -5) + "Z";
		console.log("\nstartDate: " + startDate);
		console.log("endDate:   " + endDate);

		if (!startDate) {
			// if startDate is not defined let's just use the current time as
			// the start date for the next run - and return.
			webhookData.lastTimeChecked = endDate;
			console.log("OKTA LOG TRIGGER: no start date, deferring run\n");
			return null;
		}

		const qs: IDataObject = {};
		qs.since = startDate;
		qs.until = endDate;
		qs.limit = 1000;
		if (filterExpression) {
			qs.filter = filterExpression;
		}
		if (qExpression) {
			qs.filter = qExpression;
		}

		let rsp: any;
		try {
			rsp = await oktaApiRequest.call(this, 'GET', "logs", {}, qs);
			webhookData.lastTimeChecked = endDate;
		} catch (err) {
			throw new Error(`Okta API Error: ${err}`);
		}
		if (Array.isArray(rsp) && rsp.length !== 0) {
			return [this.helpers.returnJsonArray(rsp)];
		}

		return null;
	}

}
