Real-Time Chat Application
Built for the "Basic Chat Application (Real-Time Systems Engineering)" brief: React frontend, Node.js/Express + Socket.io backend, MongoDB for persistence.
Tech stack
Frontend: React (Vite)
Backend: Node.js, Express, Socket.io
Database: MongoDB (Mongoose)
Where each requirement lives
Requirement
Implementation
Real-time bi-directional messaging
send_message / receive_message events — backend/sockets/socketHandler.js, frontend/src/components/ChatRoom.jsx
Socket rooms & event lifecycle handling
socket.join(room); full connection → join_room → send_message/typing → disconnect lifecycle in socketHandler.js
Persistent message storage
Message model, saved to MongoDB before every broadcast
User presence tracking (online/offline)
In-memory per-room presence map + User.isOnline, broadcast via presence_update
Timestamped messages
timestamp field on Message, rendered in MessageList.jsx
Separation of socket logic and API logic
Sockets live only in backend/sockets/; REST lives only in backend/routes/ + backend/controllers/ — neither depends on the other's transport
Scalable architecture awareness
See Scalability notes below
Project structure
realtime-chat-app/
├── backend/
│   ├── config/db.js
│   ├── controllers/messageController.js
│   ├── models/{User.js, Message.js}
│   ├── routes/messageRoutes.js
│   ├── sockets/socketHandler.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/{JoinScreen,ChatRoom,MessageList,MessageInput,UserList}.jsx
        ├── api/messages.js
        ├── socket.js
        └── App.jsx
Run it locally
1. Database — get a free connection string from MongoDB Atlas, or run MongoDB locally.
2. Backend
cd backend
npm install
cp .env.example .env    # paste in your MONGO_URI
npm run dev
Runs on http://localhost:5000.
3. Frontend (in a second terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
Runs on http://localhost:5173. Open it in two browser tabs and join the same room with two different names to see real-time messaging and presence working.
Getting a live website link
I can't host this myself — I don't have the ability to run a live server or hand you a working public URL directly. What I can do is get you to one fast, for free, in three steps:
Database — MongoDB Atlas (free tier). Create a cluster, add a database user, allow access from anywhere (0.0.0.0/0) under Network Access, and copy the connection string.
Backend — Render.com (free web service). Push the backend/ folder to a GitHub repo, then on Render: New → Web Service → connect the repo → build command npm install → start command npm start → add environment variables MONGO_URI and CLIENT_URL. Render gives you a URL like https://your-app.onrender.com.
Frontend — Vercel (free). Push frontend/ to GitHub, then New Project → import it → add environment variables VITE_SOCKET_URL and VITE_API_URL set to your Render backend URL → Deploy. Vercel gives you the public link, e.g. https://your-chat-app.vercel.app — that's the one to share or submit.
Then go back to Render and update CLIENT_URL to your real Vercel URL (needed for CORS), and redeploy the backend once.
Free Render services spin down when idle — the first message after a period of inactivity can take ~30 seconds while it wakes up. That's expected.
Scalability notes
Horizontal scaling: running more than one backend instance needs the @socket.io/redis-adapter so a broadcast reaches clients connected to other instances, plus sticky sessions at the load balancer.
Database indexing: Message.room is indexed since every query filters by room; there's also a compound { room: 1, timestamp: -1 } index for the "latest messages in a room" query pattern.
Pagination: message history is capped (50 by default, 200 max) instead of loading a room's full history at once.
Decoupled transports: REST and Socket.io are separate modules with no shared code path, so either can be scaled, cached, or rate-limited independently.
