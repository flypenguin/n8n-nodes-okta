import {
	IHookFunctions,
	IWebhookFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
} from 'n8n-workflow';


export class OktaEventTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Okta Event Trigger',
		name: 'oktaEventTrigger',
		//icon: 'file:oktaLogo.png',
		group: ['trigger'],
		version: 1,
		description: 'Starts the workflow when an Okta event occurs.',
		defaults: {
			name: 'Okta Event Trigger',
			color: '#1f2957',
		},
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Action Name',
				name: 'actionName',
				type: 'string',
				description: 'Choose any name you would like. It will show up as a server action in the app',
				default: '',
			},
		],
	};

	// see for existing example: pushcut trigger, https://git.io/JtwW0
	// see for some explanations: https://community.n8n.io/t/basic-example-for-http-trigger-node/4145/5
	// workflow for developing nodes: https://is.gd/KY9DB5

	// @ts-ignore (because of request)
	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// checkExists() returns a boolean for whether the webhook is
				// currently registered at the third-party service.
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// If the webhook is not registered, create() registers the
				// webhook at the third-party service and immediately checks
				// if the registration was successful. This occurs when you
				// activate the workflow from the top-right toggle (production
				// mode, persistent) or when you click on “Execute Node” (test
				// mode, for 2 minutes).
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// delete() de-registers the webhook from the third-party
				// service. This occurs when the workflow is de-activated
				// or when test mode expires.
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// webhook() receives the payload from the third-party service and
		// sends it into the workflow.

		const body = this.getBodyData() as IDataObject;

		return {
			workflowData: [
				this.helpers.returnJsonArray(body),
			],
		};
	}
}
