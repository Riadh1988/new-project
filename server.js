const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');
const { mongooseConnect } = require('./lib/mongoose');
const Ticket = require('./models/Ticket');


const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins (configure this for production)
      methods: ['GET', 'POST'],
    },
  });

  // MongoDB connection
  mongooseConnect();

  // Socket.IO event handling
 // Socket.IO event handling
io.on('connection', (socket) => {
  socket.on('join', (ticketId) => {
    socket.join(ticketId);
  });

  socket.on('message', async ({ ticketId, message }) => {
    // Emit the message to everyone in the room (ticketId)
    io.to(ticketId).emit('message', message);

    try {
      // Save the message to the database
      await Ticket.findByIdAndUpdate(ticketId, {
        $push: {
          messages: message
        }
      });
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  });
});


  

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  httpServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
