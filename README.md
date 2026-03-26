# AI Flow Builder

A dynamic, node-based AI workflow builder that allows you to create complex AI logic flows visually. Connect multiple input prompts to AI response nodes and run them all at once.

## Features

- **Dynamic Node Creation:** Add as many Input and Result nodes as you need.
- **Visual Flow Building:** Drag and drop nodes to organize your workflow.
- **Manual Connections:** Manually connect any Input to any Result node.
- **Individual Deletion:** Hover over nodes or connections to delete them individually.
- **Real-time AI Responses:** Powered by OpenRouter for intelligent text generation.
- **High-Visibility Dark Theme:** Optimized for long-term development with vibrant contrast.
- **Session Persistence:** Save your flows to MongoDB for later use.

## Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local or Atlas)
- **OpenRouter API Key** (Get one at [openrouter.ai](https://openrouter.ai/))

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/aak-na/flow-ai.git
cd flow-ai
```

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/react-flow-ai
   OPENROUTER_API_KEY=your_api_key_here
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser to `http://localhost:5173/`.
2. Click **"+ Add Input"** or **"+ Add Result"** to create new nodes.
3. Drag between the blue handles to connect an Input to a Result.
4. Type your prompt in the Input box.
5. Click **"Run Flow"** to generate AI responses.
6. Use the **"Save"** button to persist your flow.
7. Hover over nodes or click the **"×"** on connections to remove them.

## Tech Stack

- **Frontend:** React, React Flow, Vite, Vanilla CSS
- **Backend:** Node.js, Express, Mongoose
- **AI:** OpenRouter API
- **Database:** MongoDB

## Deployment Guide (Render)

Since this project has a **Backend** and a **Frontend**, you will need to create **two separate services** on Render.

### Step 1: Deploy the Backend (Web Service)
1. **Log in** to [Render](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your **flow-ai** GitHub repository.
4. **Settings:**
   - **Name:** `flow-ai-backend`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. **Environment Variables:**
   - `MONGO_URI`: (Your MongoDB connection string)
   - `OPENROUTER_API_KEY`: (Your OpenRouter key)
   - `FRONTEND_URL`: (Wait until Step 2 is done, then put your Frontend URL here)

### Step 2: Deploy the Frontend (Static Site)
1. In Render, click **New +** and select **Static Site**.
2. Connect the same GitHub repository.
3. **Settings:**
   - **Name:** `flow-ai-frontend`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. **Environment Variables:**
   - **Key:** `VITE_BACKEND_URL`
   - **Value:** (The URL of your Backend from Step 1)

### Step 3: Final Connection
Once your Frontend is deployed, grab its URL (e.g., `https://flow-ai-frontend.onrender.com`) and add it to your **Backend Service** environment variables as `FRONTEND_URL`. 
*This tells the backend it's safe to accept data from your new website!*
