<h1 align="center">⬡ Exchange Engine</h1>

<p align="center">
  <img src="https://img.shields.io/badge/node.js-18+-green?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/express-4.x-black?logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/redis-backed-red?logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/docker-ready-blue?logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License">
</p>

<p align="center">
  A stock trading simulator built with <b>Node.js</b>, <b>Express</b>, and <b>Redis</b> —<br>
  a backend engine paired with a trading-style web dashboard for real-time interaction.
</p>

---

## 🖥️ Dashboard Overview

The built-in dashboard lets you interact with the Exchange Engine visually. It connects to the Redis-backed API to manage your portfolio and test system resilience.

- **Market Tickers**: Click any symbol to auto-fill the buy form with the current price.
- **Live Balance**: Real-time cash tracking and portfolio valuation.
- **Time Machine**: Dedicated buttons for Redis snapshots and rollbacks.

<img width="1879" height="905" alt="Exchange Engine dashboard" src="https://github.com/user-attachments/assets/d8e7dac7-de2d-43f9-a3cf-56a4cf68ac9a" />

---

## ✨ Key Features

- **Real-time Market Data**: Generates simulated prices for any stock ticker (AAPL, TSLA, NVDA, etc.).
- **Trading System**: Full buy-order logic with instant balance updates and transaction logging.
- **Portfolio Analytics**: Real-time calculation of holdings and transaction history directly from Redis.
- **State Management (The "Time Machine")**:
  - **Save Snapshot**: Capture your current bank balance in Redis.
  - **Rollback**: Instantly restore your balance from the last saved snapshot.
- **Chaos Testing**: Integrated `/chaos` endpoint to verify Docker's `restart` policy under a simulated crash.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js + Express |
| **Database** | Redis (state, history, and snapshots) |
| **Frontend** | Pure HTML5, CSS3 (CSS Variables), and Vanilla JS |
| **Infrastructure** | Docker + Docker Compose |

---

## 🚀 Getting Started

### 1. Requirements

- [Docker](https://www.docker.com/) and Docker Compose.

### 2. Installation & Launch

Clone the repository and run the following command in the project root:

```bash
docker-compose up --build
```

The dashboard will be available at `http://localhost:3000` (adjust if you've changed the port in `docker-compose.yml`).

---

## 📄 License

MIT
