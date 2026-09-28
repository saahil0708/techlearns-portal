# Azure Infrastructure as Code (Bicep)

This folder contains the complete, modular Azure Bicep templates for provisioning cloud infrastructure for **CodePlatform / TechLearns Portal** following Microsoft Cloud Adoption Framework (CAF) naming conventions.

---

## Azure Cloud Adoption Framework (CAF) Naming Standards

All resources and storage containers strictly adhere to the official Azure naming rules and CAF abbreviations:

| Resource Type | CAF Prefix | Pattern | Character Limit & Rules | Example in Bicep |
| :--- | :--- | :--- | :--- | :--- |
| **Resource Group** | `rg-` | `rg-<workload>-<env>-<region>` | 1-90, alphanumeric + hyphens | `rg-codeplatform-prod-eastus` |
| **Storage Account** | `st` | `st<workload><env><unique>` | 3-24, **lowercase alphanumeric only** (no hyphens) | `stcodeplatformprod1a2b3` |
| **Blob Container** | `cnt-` | `cnt-<workload>-<purpose>-<env>` | 3-63, **lowercase letters, numbers, and single hyphens** | `cnt-codeplatform-uploads-prod` |
| **Container Registry (ACR)** | `cr` | `cr<workload><env><unique>` | 5-50, **lowercase alphanumeric only** (no hyphens) | `crcodeplatformprod1a2b3` |
| **Key Vault** | `kv-` | `kv-<workload>-<env>-<unique>` | 3-24, alphanumeric + hyphens | `kv-codeplat-prod-1a2b3` |
| **PostgreSQL Flexible Server** | `psql-` | `psql-<workload>-<env>-<unique>` | 3-63, alphanumeric + hyphens | `psql-codeplatform-prod-1a2b3c4` |
| **Azure Cache for Redis** | `redis-` | `redis-<workload>-<env>-<unique>` | 1-63, alphanumeric + hyphens | `redis-codeplatform-prod-1a2b3c4` |
| **Log Analytics Workspace** | `log-` | `log-<workload>-<env>-<unique>` | 4-63, alphanumeric + hyphens | `log-codeplatform-prod-1a2b3c4` |
| **Container Apps Environment** | `cae-` | `cae-<workload>-<env>-<unique>` | 2-32, alphanumeric + hyphens | `cae-codeplatform-prod-1a2b3c4` |
| **Container App (Backend)** | `ca-` | `ca-<workload>-backend-<env>` | 2-32, alphanumeric + hyphens | `ca-codeplatform-backend-prod` |
| **Container App (Frontend)** | `ca-` | `ca-<workload>-frontend-<env>` | 2-32, alphanumeric + hyphens | `ca-codeplatform-frontend-prod` |
| **User Assigned Identity** | `id-` | `id-<workload>-<purpose>-<env>-<unique>` | 3-128, alphanumeric + hyphens | `id-codeplatform-acrpull-prod-1a2b3` |

---

## Storage Container Naming Rules (Azure Blob Standard)

1. **Length**: Between 3 and 63 characters.
2. **Character Set**: Lowercase letters (`a-z`), numbers (`0-9`), and hyphens (`-`).
3. **Hyphen Rules**: Every hyphen must be preceded and followed by a letter or number; no consecutive hyphens (`--`).
4. **Case**: Must be strictly lowercase.
5. **Start/End**: Must start and end with a letter or number.

**Default Blob Container Folders inside `cnt-codeplatform-uploads-prod`**:
- `avatars/` — User & faculty profile avatars
- `institutions/` — College & school banners/logos
- `courses/` — Course thumbnails & lecture attachments
- `blogs/` — Technical blog covers & embedded media
- `problems/` — Coding problem assets & diagrams
- `attachments/` — General platform uploads & submissions

---

## Directory Structure

```
infra/
├── main.bicep                  # Master orchestrator template (CAF compliant)
├── main.parameters.json        # Parameter values template
├── README.md                   # Infrastructure & CAF documentation
└── modules/
    ├── acr.bicep               # Azure Container Registry (cr...)
    ├── storage.bicep           # Azure Storage Account & Blob Container (st... & cnt-...)
    ├── database.bicep          # PostgreSQL Flexible Server (psql-...)
    ├── redis.bicep             # Azure Cache for Redis (redis-...)
    ├── keyvault.bicep          # Azure Key Vault (kv-...)
    ├── container-app-env.bicep # Log Analytics & ACA Environment (log-... & cae-...)
    └── container-app.bicep     # Container App Microservice (ca-...)
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
az group create --name "rg-codeplatform-prod-eastus" --location "eastus"
```

### 3. Validate & Deploy Bicep Template
```bash
az deployment group create \
  --resource-group "rg-codeplatform-prod-eastus" \
  --template-file "./infra/main.bicep" \
  --parameters "./infra/main.parameters.json" \
  --parameters dbAdminPassword="<YourSecurePassword123!>" jwtSecret="<YourRandomJwtSecretKey456!>"
```
