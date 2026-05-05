⬡ Exchange Engine

A Stock trading simulator built with **Node.js**, **Express**, and **Redis**. This project features a high-performance backend and a trading-style web dashboard for real-time interaction.

---

## 🖥️ Dashboard Overview

The built-in dashboard allows you to interact with the Exchange Engine visually. It connects to the Redis-backed API to manage your portfolio and test system resilience.

*   **Market Tickers**: Click any symbol to auto-fill the buy form with current price.
*   **Live Balance**: Real-time cash tracking and portfolio valuation.
*   **Time Machine**: Dedicated buttons for Redis snapshots and rollbacks.
<img width="1879" height="905" alt="image" src="https://github.com/user-attachments/assets/d8e7dac7-de2d-43f9-a3cf-56a4cf68ac9a" />

---

## ✨ Key Features

*   **Real-time Market Data**: Generates simulated prices for any stock ticker (AAPL, TSLA, NVDA, etc.).
*   **Trading System**: Full buy-order logic with instant balance updates and transaction logging.
*   **Portfolio Analytics**: Real-time calculation of holdings and transaction history directly from Redis.
*   **State Management (The "Time Machine")**:
    *   **Save Snapshot**: Capture your current bank balance in Redis.
    *   **Rollback**: Instantly restore your balance from the last saved snapshot.
*   **Chaos Testing**: Integrated `/chaos` endpoint to verify Docker's `restart` policies in a simulated crash.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js + Express |
| **Database** | Redis (for state, history, and snapshots)[cite: 1] |
| **Frontend** | Pure HTML5, CSS3 (CSS Variables), and Vanilla JS[cite: 1] |
| **Infrastructure** | Docker + Docker Compose[cite: 1] |

---

## 🚀 Getting Started

### 1. Requirements
*   [Docker](https://www.docker.com/) and Docker Compose.

### 2. Installation & Launch
Clone the repository and run the following command in the project root:

```bash
docker-compose up --build
