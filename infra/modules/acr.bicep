@description('The Azure region where the Container Registry will be deployed')
param location string = resourceGroup().location

@description('The name of the Azure Container Registry')
param acrName string

@description('The SKU of the Container Registry')
@allowed([
  'Basic'
  'Standard'
  'Premium'
])
param acrSku string = 'Basic'

resource acr 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: acrName
  location: location
  sku: {
    name: acrSku
  }
  properties: {
    adminUserEnabled: true
  }
}

output acrId string = acr.id
output acrLoginServer string = acr.properties.loginServer
output acrName string = acr.name

