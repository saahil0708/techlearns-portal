@description('The Azure region where the Storage Account will be deployed')
param location string = resourceGroup().location

@description('The name of the Storage Account (3-24 characters, lowercase alphanumeric only)')
@minLength(3)
@maxLength(24)
param storageAccountName string

@description('The Storage Account SKU')
@allowed([
  'Standard_LRS'
  'Standard_GRS'
  'Standard_ZRS'
  'Premium_LRS'
])
param storageSku string = 'Standard_LRS'

@description('The primary blob container name')
param containerName string = 'techlearns-skillos-uploads-prod'

@description('The public access level for the primary container')
@allowed([
  'None'
  'Blob'
  'Container'
])
param containerPublicAccess string = 'Blob'

@description('The public blob container name for static public media')
param publicMediaContainerName string = 'techlearns-skillos-media-prod'

@description('Whether public blob access is enabled at the account level')
param allowBlobPublicAccess bool = true

resource storageAccount 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: storageSku
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    allowBlobPublicAccess: allowBlobPublicAccess
    minimumTlsVersion: 'TLS1_2'
    supportsHttpsTrafficOnly: true
    allowSharedKeyAccess: true
    encryption: {
      services: {
        blob: {
          enabled: true
        }
      }
      keySource: 'Microsoft.Storage'
    }
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  parent: storageAccount
  name: 'default'
  properties: {
    cors: {
      corsRules: [
        {
          allowedOrigins: [
            '*'
          ]
          allowedMethods: [
            'GET'
            'HEAD'
            'PUT'
            'OPTIONS'
            'POST'
          ]
          maxAgeInSeconds: 3600
          exposedHeaders: [
            '*'
          ]
          allowedHeaders: [
            '*'
          ]
        }
      ]
    }
  }
}

// 1. Primary Container (Public access for uploads & media assets)
resource primaryContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: containerName
  properties: {
    publicAccess: containerPublicAccess
  }
}

// 2. Public Media Container (Anonymous read access for public avatars, blog covers, badges)
resource publicMediaContainer 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-01-01' = {
  parent: blobService
  name: publicMediaContainerName
  properties: {
    publicAccess: 'Blob'
  }
}

output storageAccountId string = storageAccount.id
output storageAccountName string = storageAccount.name
output primaryBlobEndpoint string = storageAccount.properties.primaryEndpoints.blob
output containerName string = primaryContainer.name
output publicMediaContainerName string = publicMediaContainer.name
