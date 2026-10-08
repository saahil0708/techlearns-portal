@description('The Azure region where Service Bus will be deployed')
param location string = resourceGroup().location

@description('The name of the Azure Service Bus Namespace')
param serviceBusNamespaceName string

@description('The SKU of the Service Bus Namespace (Standard supports Queues, Peek-Lock & Dead-lettering)')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param skuName string = 'Standard'

@description('The name of the submissions queue')
param queueName string = 'submissions'

@description('Lock duration for messages (e.g. PT1M = 1 minute, PT5M = 5 minutes)')
param lockDuration string = 'PT1M'

@description('Max delivery count before message is moved to dead-letter queue')
param maxDeliveryCount int = 10

@description('Default message time to live (e.g. P14D = 14 days)')
param defaultMessageTimeToLive string = 'P14D'

resource serviceBusNamespace 'Microsoft.ServiceBus/namespaces@2022-10-01-preview' = {
  name: serviceBusNamespaceName
  location: location
  sku: {
    name: skuName
    tier: skuName
  }
  properties: {
    minimumTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource submissionsQueue 'Microsoft.ServiceBus/namespaces/queues@2022-10-01-preview' = {
  parent: serviceBusNamespace
  name: queueName
  properties: {
    lockDuration: lockDuration
    maxDeliveryCount: maxDeliveryCount
    defaultMessageTimeToLive: defaultMessageTimeToLive
    deadLetteringOnMessageExpiration: true
    requiresDuplicateDetection: false
    requiresSession: false
    enableBatchedOperations: true
  }
}

resource authRules 'Microsoft.ServiceBus/namespaces/authorizationRules@2022-10-01-preview' existing = {
  parent: serviceBusNamespace
  name: 'RootManageSharedAccessKey'
}

output serviceBusNamespaceId string = serviceBusNamespace.id
output serviceBusNamespaceName string = serviceBusNamespace.name
output queueName string = submissionsQueue.name
output serviceBusEndpoint string = serviceBusNamespace.properties.serviceBusEndpoint
output primaryConnectionString string = authRules.listKeys().primaryConnectionString
