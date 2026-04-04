# User Connection & Messaging Feature Guide

## Overview

This guide explains how the new connection and messaging system works in the Civic Issue platform.

## What Was Built

### 1. **Connection System** (`useConnections` hook)

- Users can send connection requests to other users with complementary roles
- Connection requests must be approved before messaging
- Role-based restrictions prevent same-role connections:
  - Citizens can connect with Workers & Admins
  - Workers can connect with Citizens & Admins
  - Admins can connect with anyone (Citizens & Workers)

### 2. **Key Files Created**

#### Hooks

- **`client/src/hooks/useConnections.js`** - Core connection logic
  - Connection request management
  - Message handling
  - Connection lifecycle (send, accept, reject, remove)

#### Components

- **`client/src/components/ConnectionPanel.jsx`** - Connection management UI
  - View pending requests
  - Manage sent requests
  - View & message connected users
  - Quick message modal

- **`client/src/components/ConnectionBrowser.jsx`** - Browse & connect with users
  - Display available users to connect with
  - Send connection requests
  - Show connection status (Connected, Pending, etc.)

#### Pages

- **`client/src/pages/Messages.jsx`** - Full messaging interface
  - Conversation list on desktop
  - Message history with timestamps
  - Real-time message display
  - Mobile-friendly chat interface

#### Integration

- **`client/src/App.jsx`** - Added `/messages` route
- **`client/src/components/Navbar.jsx`** - Added Messages link to navigation
- **`client/src/pages/WorkerDashboard.jsx`** - Added ConnectionPanel
- **`client/src/pages/AdminDashboard.jsx`** - Added ConnectionPanel

## How It Works

### Connection Flow

```
1. User A clicks "Connect" on User B's profile
   ↓
2. Connection request is created and stored
   ↓
3. User B sees pending request in ConnectionPanel
   ↓
4. User B accepts/rejects request
   ↓
5. If accepted → Users are "Connected"
   ↓
6. Connected users can now message each other
```

### Messaging Flow

```
1. Open Messages page from navbar
   ↓
2. Select a connected user from the list
   ↓
3. View message history in the chat area
   ↓
4. Type and send messages
   ↓
5. Messages are timestamped and stored
```

## Data Storage

All connections and messages are stored in **localStorage**:

- `civicConnections` - Array of active connections
- `civicConnectionRequests` - Array of pending requests
- `civicMessages` - Array of all messages

**Note:** This is frontend-only storage. For production, connect to a backend API.

## Using the Feature

### For Citizens

1. Go to **Messages** in the navbar
2. When viewing issues or workers, click **Connect** to send requests
3. Accept connection requests from workers/admins
4. Start messaging connected users

### For Workers

1. Open **Worker Dashboard**
2. Scroll to **Connections** panel
3. Send requests to admins or citizens
4. View pending requests and manage connections
5. Go to **Messages** page to chat

### For Admins

1. Open **Admin Dashboard**
2. Scroll to **Connections** panel
3. Connect with workers or citizens
4. Use **Messages** for communication

## Component API

### useConnections Hook

```javascript
const {
  connections, // All connections for current user
  connectionRequests, // All pending requests
  messages, // All messages
  sendConnectionRequest, // (targetUser) => result
  acceptConnectionRequest, // (requestId) => result
  rejectConnectionRequest, // (requestId) => result
  getPendingRequests, // Returns pending requests for current user
  getSentRequests, // Returns sent requests
  getMyConnections, // Returns all connections for current user
  getOtherUser, // Gets other user from connection
  sendMessage, // (connectionId, content) => result
  getConnectionMessages, // (connectionId) => messages
  markAsRead, // (connectionId) => void
  removeConnection, // (connectionId) => result
  canConnect, // (otherUserRole) => boolean
} = useConnections();
```

### ConnectionPanel Component

```javascript
<ConnectionPanel />
// Shows:
// - Pending connection requests (with accept/reject)
// - Sent requests (can cancel)
// - Connected users (with message button)
// - Tabbed interface for easy navigation
```

### ConnectionBrowser Component

```javascript
<ConnectionBrowser
  availableUsers={[...]}  // Array of users
  title="Available Users" // Custom title (optional)
/>
// Shows:
// - Grid of users
// - Connect button with status
// - Rating & job count for workers
```

### Messages Page

```javascript
<Messages />
// Full page route at `/messages`
// Shows:
// - Conversation list (sidebar on desktop)
// - Chat interface
// - Message input with Send button
// - Mobile-responsive design
```

## Next Steps (Optional Enhancements)

1. **Backend Integration**
   - Replace localStorage with API calls
   - Add real-time messaging with sockets (Socket.io, WebSockets)
   - Persist data in database

2. **UI Enhancements**
   - Add typing indicators
   - Show "online" status
   - Add message reactions/emojis
   - Add file attachment support

3. **Notifications**
   - Push notifications for new messages
   - Toast alerts for connection requests
   - Notification counter in navbar

4. **Search & Discovery**
   - Search for users by name/role
   - Filter by rating, availability, etc.
   - Browse worker profiles

5. **Advanced Features**
   - Message search
   - Block/unblock users
   - Group conversations
   - Message archiving

## Testing the Feature

### Test Scenario 1: Basic Connection

1. Login as **Citizen** (email: any@email.com)
2. Go to **Messages**
3. Open **Worker Dashboard** in new tab (login as Worker)
4. Click **Connect** button in Connections panel
5. Switch back to Citizen → See pending request
6. Accept request → Now connected!
7. Click **Message** button to start chatting

### Test Scenario 2: Connection Restrictions

1. Login as two Citizens
2. Try to connect with each other
3. Should see "Cannot connect with users of the same role" error

### Test Scenario 3: Admin Connections

1. Login as **Admin**
2. In Admin Dashboard, scroll to Connections
3. Can connect with both Workers and Citizens
4. Send requests to multiple users
5. Manage all connections from one place

## Troubleshooting

**Problem:** Connections not appearing

- **Solution:** Check browser's localStorage is enabled
- Clear localStorage and try again

**Problem:** Messages not sending

- **Solution:** Verify you have an active connection with the user
- Check browser console for errors

**Problem:** Can't see ConnectionPanel

- **Solution:** Clear browser cache
- Make sure you're logged in
- Check that you're on a protected page

## Database Schema (for future backend)

```javascript
// Connection Schema
{
  id: string,
  user1: { id, name, role },
  user2: { id, name, role },
  connectedAt: ISO timestamp,
  lastMessageAt: ISO timestamp
}

// Connection Request Schema
{
  id: string,
  fromId: string,
  fromUser: { id, name, role },
  toId: string,
  toUser: { id, name, role },
  status: "pending" | "accepted" | "rejected",
  createdAt: ISO timestamp
}

// Message Schema
{
  id: string,
  connectionId: string,
  senderId: string,
  senderName: string,
  content: string,
  timestamp: ISO timestamp,
  read: boolean
}
```

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Frontend testing, needs Backend integration
