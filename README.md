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

## Deployment on Render

If you are deploying the frontend and backend as separate services on Render:

1. **Backend Service:**
   - Set environment variables: `MONGO_URI`, `OPENROUTER_API_KEY`.
   - The `PORT` is handled automatically.

2. **Frontend (Static Site/Web Service):**
   - Set an environment variable: `VITE_API_URL`.
   - Set its value to your backend's Render URL (e.g., `https://flow-ai-backend.onrender.com`).
   - This tells the frontend where to find the API.
