import {
	ICredentialType,
	NodePropertyTypes,
} from 'n8n-workflow';


export class OktaApiToken implements ICredentialType {
	name = 'oktaApiToken';
	displayName = 'Okta API token';
	properties = [
		// The credentials to get from user and save encrypted.
		// Properties can be defined exactly in the same way
		// as node properties.
		{
			displayName: 'API token',
			name: 'token',
			type: 'string' as NodePropertyTypes,
			default: '',
		},
		{
			displayName: 'Okta tenant FQDN',
			name: 'fqdn',
			type: 'string' as NodePropertyTypes,
			default: 'example.okta.com',
		},
	];
}
