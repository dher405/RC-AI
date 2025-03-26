# 📞 RingCentral AI Admin App

AI-powered platform to help customers manage their RingCentral accounts through a conversational interface, backed by role-based administration, billing integration, and full RingCentral API support.

---

## 🚀 Project Goals

- Enable **AI-driven** administration of RingCentral accounts
- Allow customers to interact via a **natural language assistant**
- Include an **admin portal** for internal team members to manage customers, billing, impersonation, and auditing
- Integrate **RingCentral OAuth**, **Stripe billing**, and **ChatGPT API**
- Start with **single-tenant architecture**, built to scale

---

## 🧱 Tech Stack

| Layer       | Technology                |
|-------------|---------------------------|
| Frontend    | React (Next.js), Tailwind |
| Backend     | FastAPI                   |
| Auth        | RingCentral OAuth2        |
| AI Engine   | OpenAI (GPT-4 Turbo)      |
| Database    | PostgreSQL / Firebase     |
| Billing     | Stripe                    |
| Hosting     | Vercel + Railway / Render |

---

## ✨ Core Features

### 🔐 Authentication
- RingCentral OAuth login required to start
- Role-based access for internal users

### 🧠 AI Assistant
- Conversational UI for customers
- Function calling via OpenAI
- Optional approval step before applying changes

### 💼 Admin Portal
- User impersonation
- View audit logs & API call history
- Deal and refund management

### 💳 Billing
- Manual signup with 2-week trial
- Stripe-based monthly subscriptions
- Grace periods for failed payments

---

## 📁 Folder Structure (Simplified)


