@description('The Azure region where the Container App will be deployed')
param location string = resourceGroup().location

@description('The name of the Container App')
param appName string

@description('The resource ID of the Container Apps Environment')
param environmentId string

@description('The Container image to run')
param containerImage string

@description('The target port for ingress traffic')
param targetPort int

@description('Whether ingress is external (accessible from Internet) or internal')
param isExternalIngress bool = true

@description('CPU cores allocated to the container (e.g. 0.25, 0.5, 1.0)')
param cpu string = '0.5'

@description('Memory allocated to the container (e.g. 0.5Gi, 1.0Gi, 2.0Gi)')
param memory string = '1.0Gi'

@description('Minimum replica count')
param minReplicas int = 1

@description('Maximum replica count')
param maxReplicas int = 5

@description('Path for HTTP health probes (e.g. /health or /)')
param healthCheckPath string = ''

@description('Environment variables to pass to the container')
param envVars array = []

@description('Secrets for the container app')
@secure()
param secrets array = []

@description('Container Registry server')
param registryServer string = ''

@description('Container Registry username')
param registryUsername string = ''

@description('Container Registry password secret reference')
@secure()
param registryPassword string = ''

@description('User Assigned Managed Identity Resource ID for ACR Pull')
param userAssignedIdentityId string = ''

var registries = !empty(registryServer) ? [
  !empty(userAssignedIdentityId) ? {
    server: registryServer
    identity: userAssignedIdentityId
  } : {
    server: registryServer
    username: registryUsername
    passwordSecretRef: 'acr-password'
  }
] : []

var allSecrets = !empty(registryPassword) && empty(userAssignedIdentityId) ? concat(secrets, [
  {
    name: 'acr-password'
    value: registryPassword
  }
]) : secrets

var probes = !empty(healthCheckPath) ? [
  {
    type: 'Liveness'
    httpGet: {
      path: healthCheckPath
      port: targetPort
    }
    initialDelaySeconds: 15
    periodSeconds: 10
    failureThreshold: 3
    timeoutSeconds: 3
  }
  {
    type: 'Readiness'
    httpGet: {
      path: healthCheckPath
      port: targetPort
    }
    initialDelaySeconds: 10
    periodSeconds: 5
    failureThreshold: 3
    timeoutSeconds: 3
  }
  {
    type: 'Startup'
    httpGet: {
      path: healthCheckPath
      port: targetPort
    }
    initialDelaySeconds: 5
    periodSeconds: 5
    failureThreshold: 10
    timeoutSeconds: 3
  }
] : []

resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: appName
  location: location
  identity: !empty(userAssignedIdentityId) ? {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${userAssignedIdentityId}': {}
    }
  } : null
  properties: {
    managedEnvironmentId: environmentId
    configuration: {
      activeRevisionsMode: 'Single'
      ingress: {
        external: isExternalIngress
        targetPort: targetPort
        transport: 'auto'
        allowInsecure: false
      }
      registries: registries
      secrets: allSecrets
    }
    template: {
      containers: [
        {
          name: appName
          image: containerImage
          resources: {
            cpu: json(cpu)
            memory: memory
          }
          env: envVars
          probes: probes
        }
      ]
      scale: {
        minReplicas: minReplicas
        maxReplicas: maxReplicas
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
        ]
      }
    }
  }
}

output fqdn string = containerApp.properties.configuration.ingress.fqdn
output url string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
