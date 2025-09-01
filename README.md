# 🏬 Store API (Serverless + AWS + GitHub Actions)

This repository contains the backend for **Store API**, organized into separate **microservices** using the [Serverless Framework](https://www.serverless.com/).  
Each service is independently deployable and versioned, making the project **scalable and modular**.

---

## 📂 Project Structure

```
store-api/
│── homepage-api/        # Controls homepage layout & versions
│   ├── handler.py
│   ├── serverless.yml
│   └── requirements.txt
│── products-api/        # Handles products
│   ├── handler.py
│   ├── serverless.yml
│   └── requirements.txt
│── categories-api/      # Manages categories
│   ├── handler.py
│   ├── serverless.yml
│   └── requirements.txt
└── .github/
    └── workflows/
        └── deploy.yml   # CI/CD pipeline
```

---

## ⚙️ Requirements

- [Python 3.11+](https://www.python.org/downloads/)
- [pip3](https://pip.pypa.io/en/stable/installation/)
- [Node.js & npm](https://nodejs.org/en/)
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/):

```bash
npm install -g serverless
```

---

## 📦 Install dependencies

Inside each service folder (`homepage-api`, `products-api`, `categories-api`):

```bash
pip3 install -r requirements.txt
```

To update dependencies:

```bash
pip3 freeze > requirements.txt
```

---

## 🚀 Deployment

### Manual Deployment
From inside the service folder:

```bash
sls deploy --stage prod
```

### Automated Deployment (GitHub Actions)

The pipeline is defined in `.github/workflows/deploy.yml`.

- **Trigger**: Deploys only the service that changed (`homepage-api/**`, `products-api/**`, `categories-api/**`).
- **Selective Deploy**: If you commit with message `[homepage]`, `[products]`, or `[categories]`, only that service is deployed.
- **AWS Credentials**: Must be stored in GitHub Secrets:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`

---

## 🔄 CI/CD Workflow (GitHub Actions)

- On `push` to `main`, the workflow checks which service folder was modified.
- Only the modified service is deployed with Serverless.

Example workflow snippet:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'homepage-api/**'
      - 'products-api/**'
      - 'categories-api/**'
```

Jobs:
- `deploy-homepage` → deploys Homepage API  
- `deploy-products` → deploys Products API  
- `deploy-categories` → deploys Categories API  

---