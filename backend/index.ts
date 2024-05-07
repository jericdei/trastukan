interface Message {
  user: string;
  message: string;
}

let users: string[] = [];
let messages: Message[] = [];

const socket = Bun.serve<{ user: string }>({
  async fetch(req, server) {
    const { user } = await req.json();

    const success = server.upgrade(req, {
      data: {
        user,
      },
    });

    return success
      ? undefined
      : new Response("Upgrade failed :(", { status: 500 });
  },
  websocket: {
    open(ws) {
      users.push(ws.data.user);

      ws.subscribe("trastukan");

      ws.publish(
        "chat",
        JSON.stringify({ type: "USERS_ADD", data: ws.data.user })
      );

      ws.send(JSON.stringify({ type: "USERS_SET", data: users }));
      ws.send(JSON.stringify({ type: "MESSAGES_SET", data: messages }));
    },
    async message(ws, data) {
      const message = JSON.parse(data as any) as Message;
      message.user = ws.data.user;

      messages.push(message);

      // Send message to all clients subscribed to the chat channel with new message
      ws.publish(
        "chat",
        JSON.stringify({ type: "MESSAGES_ADD", data: message })
      );
    },
    close(ws) {
      users = users.filter((user) => user !== ws.data.user);

      // Send message to all clients subscribed to the chat channel that user left
      ws.publish(
        "chat",
        JSON.stringify({ type: "USERS_REMOVE", data: ws.data.user })
      );
    },
  },
});

console.log(`Listening on ${socket.hostname}:${socket.port}`);
