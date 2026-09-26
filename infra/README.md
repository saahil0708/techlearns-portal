# Azure Infrastructure as Code (Bicep)

This folder contains the complete, modular Azure Bicep templates for provisioning the cloud infrastructure for **CodePlatform / TechLearns Portal**.

## Architecture Overview

- **Azure Container Apps (ACA)**:
  - **Backend API (`/server`)**: NestJS GraphQL + REST server on port 8000
  - **Frontend Web (`/client`)**: Next.js SSR Web Client on port 3000
- **Azure Container Registry (ACR)**: Private Docker registry for backend and frontend container images
- **Azure Database for PostgreSQL (Flexible Server)**: Managed PostgreSQL 16 database for Prisma ORM
- **Azure Cache for Redis**: Redis instance for BullMQ queues, caching, and rate limiting
- **Azure Key Vault**: Secure secrets and credential management
- **Azure Monitor / Log Analytics**: Centralized application and container logs

---

## Directory Structure

```
infra/
├── main.bicep               # Master orchestrator template
├── main.parameters.json     # Parameter values template
├── README.md                # Infrastructure documentation
└── modules/
    ├── acr.bicep            # Azure Container Registry
    ├── database.bicep       # PostgreSQL Flexible Server
    ├── redis.bicep          # Azure Cache for Redis
    ├── keyvault.bicep       # Azure Key Vault
    ├── container-app-env.bicep # Log Analytics & ACA Managed Environment
    └── container-app.bicep  # Container App definition
```

---

## How to Deploy via Azure CLI

### 1. Log in and Set Subscription
```bash
az login
az account set --subscription "<Your-Subscription-ID-or-Name>"
```

### 2. Create Resource Group
```bash
az group create --name "rg-techlearns-prod" --location "eastus"
```

### 3. Deploy Bicep Template
```bash
az deployment group create \
  --resource-group "rg-techlearns-prod" \
  --template-file "./infra/main.bicep" \
  --parameters "./infra/main.parameters.json" \
  --parameters dbAdminPassword="<YourSecurePassword123!>" jwtSecret="<YourRandomJwtSecretKey456!>"
```

---

## Deploy via Azure DevOps Pipeline

Add this task to your `azure-pipelines.yml`:

```yaml
- task: AzureResourceManagerTemplateDeployment@3
  inputs:
    deploymentScope: 'Resource Group'
    azureResourceManagerConnection: '<Your-Azure-Service-Connection>'
    subscriptionId: '$(SubscriptionId)'
    action: 'Create Or Update Resource Group'
    resourceGroupName: 'rg-techlearns-prod'
    location: 'East US'
    templateLocation: 'Linked artifact'
    csmFile: '$(Build.SourcesDirectory)/infra/main.bicep'
    csmParametersFile: '$(Build.SourcesDirectory)/infra/main.parameters.json'
    overrideParameters: '-dbAdminPassword $(DbAdminPassword) -jwtSecret $(JwtSecret)'
    deploymentMode: 'Incremental'
```
