import "./App.css";
import { useState, useEffect, useRef } from "react";
import { CirclePlus, Copy, LogIn, LogOut, SendHorizonal } from 'lucide-react';



// Simple interface for our chat messages.
interface ChatMessage {
  sender: string;
  message: string;
}

// Helper to generate a random string like "Hx1234"
const generateRandomId = (): string => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const randomLetters =
    letters.charAt(Math.floor(Math.random() * letters.length)) +
    letters.charAt(Math.floor(Math.random() * letters.length));
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return randomLetters + randomDigits;
};



export default function App() {

  // Our client identifier.
  const [clientId, setClientId] = useState<string>("");
  // The room id to join.
  const [roomId, setRoomId] = useState<string>("");
  // Whether we have successfully joined a room.
  const [joined, setJoined] = useState<boolean>(false);
  // Error messages on the landing screen.
  const [error, setError] = useState<string>("");
  // Input for joining a room.
  const [joinRoomInput, setJoinRoomInput] = useState<string>("");
  // WebSocket connection.
  const [ws, setWs] = useState<WebSocket | null>(null);
  // Chat messages.
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Input for chat messages.
  const [chatInput, setChatInput] = useState<string>("");

  // On mount, generate a client id.
  useEffect(() => {
    setClientId(generateRandomId());
  }, []);

  // When the user has joined, create and open the WebSocket connection.
  useEffect(() => {
    if (joined) {
      const socket = new WebSocket("ws://localhost:8081");
      socket.onopen = () => {
        console.log("WebSocket connected");
        // Send the join message in your backend's expected format.
        const joinMsg = {
          type: "join",
          payload: { roomId }
        };
        socket.send(JSON.stringify(joinMsg));
      };

      socket.onmessage = (event) => {
        try {
          // Expect that the server sends the chat message as a string,
          // which we try to parse as JSON (containing {sender, message}).
          // If parsing fails, we treat it as plain text.
          let chat: ChatMessage;
          try {
            chat = JSON.parse(event.data) as ChatMessage;
          } catch {
            chat = { sender: "unknown", message: event.data };
          }
          // If the message is not from us, append it.
          if (chat.sender !== clientId) {
            setMessages((prev) => [...prev, chat]);
          }
        } catch (err) {
          console.error("Error processing incoming message:", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected");
      };

      setWs(socket);
      return () => {
        socket.close();
      };
    }
  }, [joined, roomId, clientId]);

  // Handler for "Create New Room" – generate a room id and join.
  const handleCreateRoom = () => {
    const newRoomId = generateRandomId();
    setRoomId(newRoomId);
    setJoined(true);
    setError("");
  };

  // Handler for "Join Room" – if input is non-empty, join that room.
  const handleJoinRoom = (e: any) => {
    e.preventDefault();
    if (joinRoomInput.trim() === "") {
      setError("Please enter a room ID to join.");
      return;
    }
    setRoomId(joinRoomInput.trim());
    setJoined(true);
    setError("");
  };
  

  const getCurrentTime = (): string => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
  

  // Handler for sending a chat message.
  const handleSendChat = (e: any) => {
    e.preventDefault();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      setError("WebSocket is not connected.");
      return;
    }
    if (chatInput.trim() === "") return;
    // Wrap chat data (including sender) in a JSON string.
    const chatData = {
      sender: clientId,
      message: chatInput.trim(),
      time: getCurrentTime()
    };
    const outgoing = {
      type: "chat",
      payload: { message: JSON.stringify(chatData) }
    };
    ws.send(JSON.stringify(outgoing));
    // Also immediately add our own message to the chat.
    setMessages((prev) => [...prev, chatData]);
    setChatInput("");
  };




  return <div className="flex justify-center items-center h-screen w-full text-white font-poppins">
    {(joined) ?
      <ChatMessage
        handleSendChat={handleSendChat}
        setChatInput={setChatInput}
        messages={messages}
        roomId={roomId}
        chatInput={chatInput}
        clientId={clientId}
        setJoined={setJoined}
      /> :
      <Conncetion
        handleCreateRoom={handleCreateRoom}
        handleJoinRoom={handleJoinRoom}
        setJoinRoomInput={setJoinRoomInput}
        joinRoomInput={joinRoomInput}
        clientId={clientId}
      />}
  </div>
}

function ChatMessage({ handleSendChat, setChatInput, messages, roomId, clientId, chatInput, setJoined }: any) {
  const copyTextToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Text copied to clipboard successfully!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Create a ref to the input element.
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the pressed key is '/'
      if (event.key === "/") {
        // Optionally prevent the default behavior (if needed)
        event.preventDefault();
        // Only focus if not already typing in an input
        if (document.activeElement && document.activeElement.tagName.toLowerCase() !== "input") {
          inputRef.current?.focus();
        }
      }
    };

    // Add event listener to the window
    window.addEventListener("keydown", handleKeyDown);

    // Clean up on component unmount.
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom smoothly whenever messages update.
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  

  return <>
    <div className="h-3/4 w-[900px] flex flex-col gap-2 p-2">
      <div className="bg-slate-800 p-4 rounded-xl w-full flex justify-between items-center shadow-sm shadow-slate-400">
        <h1 className="text-2xl flex gap-3 items-center">
          @{roomId} <Copy
            className="hover:text-black"
            onClick={() => copyTextToClipboard(roomId)}
          /> </h1>
        <button
          className="flex gap-2 bg-black px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300"
          onClick={() => { setJoined(false) }}
        ><LogOut /><p className="sm:block hidden">Exit</p></button>
      </div>
      <div 
      className="bg-slate-800 w-full h-[80%] flex flex-col gap-2 rounded-xl p-4 shadow-sm shadow-slate-400 overflow-x-auto no-scrollbar"
      ref={endOfMessagesRef} 
      >
        {messages.map((msg: any, index: any) => {
          return <ChatBubble
            message={msg.message}
            key={index}
            time={msg.time}
            sender={(msg.sender === clientId) ? "me" : "user"}
            clientId={clientId}
          />
        })}
      </div >
      <form
        className="bg-slate-800 w-full rounded-xl p-2 flex gap-2 shadow-sm shadow-slate-400"
        onSubmit={handleSendChat}
      >
        <input
          ref={inputRef}
          className="rounded-lg h-full w-5/6 text-wrap outline outline-1 outline-black bg-inherit p-2 text-lg transition-all duration-100"
          type="text"
          placeholder="Type a message..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
        ></input>
        <button
          className="flex justify-center items-center gap-2 p-2 sm:text-xl bg-black w-1/6 rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300"
          type="submit"
        ><p className="sm:block hidden">Send</p> <SendHorizonal /></button>
      </form>
    </div>
  </>
}

function Conncetion({ handleCreateRoom, handleJoinRoom, setJoinRoomInput, joinRoomInput }: any) {
  return <>
    <div className=" flex flex-col gap-4 p-2">
      <div className="text-4xl font-script bg-slate-800 p-4 rounded-xl text-center shadow-sm shadow-slate-400">
        ROOM-CHAT
      </div>
      <form
        className="bg-slate-800 p-4 rounded-xl flex flex-col sm:flex-row gap-4 shadow-sm shadow-slate-400"
        onSubmit={handleJoinRoom}
      >
        <input
          type="text"
          value={joinRoomInput}
          className="rounded-lg h-full sm:w-5/6 w-full outline outline-1 outline-black bg-inherit p-2 text-lg transition-all duration-100"
          placeholder="Enter Room ID to join"
          onChange={(e) => setJoinRoomInput(e.target.value)}
        ></input>
        <button
          className="flex justify-center items-center gap-2 p-2 bg-black sm:w-1/6 w-full rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300"
          type="submit"
        >Join <LogIn /></button>
      </form>
      <div className="bg-slate-800 p-4 rounded-xl h-20 shadow-sm shadow-slate-400">
        <button
          className="flex w-full h-full justify-center items-center gap-2 text-xl bg-black rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300"
          onClick={handleCreateRoom}
        >Create Room <CirclePlus /></button>
      </div>
      <div className="bg-slate-800 p-4 flex gap-2 sm:flex-row flex-col justify-center items-center rounded-xl text-slate-400 shadow-sm shadow-slate-400">
        Created by <a href="https://github.com/Basharkhan7776" className="text-slate-300 font-bold text-xl hover:text-slate-600">@_Bashar_Khan_</a>
      </div>
    </div>
  </>
}

function ChatBubble({ message, time, sender, clientId }: { message: string, time: string, sender: string, clientId: string }) {
  return <>
    {(sender == "me") ?
      <div className="w-full flex justify-end">
        <div className="bg-black flex flex-col px-4 py-2 rounded-xl rounded-ee-none max-w-96 ">
          <div>
            {message}
          </div>
          <div className="flex justify-end text-[10px]">
            {time}
          </div>
        </div>
      </div> :
      <div className="w-full flex">
        <div className="bg-slate-700 flex flex-col px-4 py-2 rounded-xl rounded-es-none max-w-96 ">
          <div className="text-black text-[10px] font-semibold">
            {clientId}
          </div>
          <div>
            {message}
          </div>
          <div className="flex justify-end text-[10px]">
            {time}
          </div>
        </div>
      </div>
    }
  </>
}