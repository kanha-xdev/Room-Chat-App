import "./App.css";
import { CirclePlus, Copy, LogIn, LogOut, SendHorizonal } from 'lucide-react';


const temp = true;

export default function App() {
  return <div className="flex justify-center items-center h-screen w-full text-white font-poppins">
    {(temp) ? <ChatMessage /> : <Conncetion />}
  </div>
}

function ChatMessage() {
  return <>
    <div className="h-3/4 w-1/2 flex flex-col gap-2">
      <div className="bg-slate-800 p-4 rounded-xl w-full flex justify-between items-center shadow-sm shadow-slate-400">
        <h1 className="text-2xl flex gap-3 items-center">@Hx1234 <Copy className="hover:text-black"/> </h1>
        <button className="flex gap-2 bg-black px-4 py-2 rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300"><LogOut />Exit</button>
      </div>
      <div className="bg-slate-800 w-full h-[80%] flex flex-col gap-2 rounded-xl p-4 shadow-sm shadow-slate-400">
        <ChatBubble message="Hello whats up?" time="12:30" sender="user" />
        <ChatBubble message="I am fine thanks" time="12:31" sender="me" />
      </div>
      <form className="bg-slate-800 w-full h-[10%] rounded-xl p-2 flex gap-2 shadow-sm shadow-slate-400">
        <input className="rounded-lg h-full w-5/6 text-wrap outline outline-1 outline-black bg-inherit p-2 text-lg transition-all duration-100"></input>
        <button className="flex justify-center items-center gap-2 text-xl bg-black w-1/6 rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300">Send <SendHorizonal /></button>
      </form>
    </div>
  </>
}

function Conncetion() {
  return <>
    <div className="w-1/3 flex flex-col gap-4 ">
      <div className="text-4xl font-script bg-slate-800 p-4 rounded-xl text-center shadow-sm shadow-slate-400">
        ROOM-CHAT
      </div>
      <form className="bg-slate-800 p-4 rounded-xl flex gap-4 shadow-sm shadow-slate-400">
        <input className="rounded-lg h-full w-5/6 outline outline-1 outline-black bg-inherit p-2 text-lg transition-all duration-100" placeholder=""></input>
        <button className="flex justify-center items-center gap-2 bg-black w-1/6 rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300">Join <LogIn /></button>
      </form>
      <div className="bg-slate-800 p-4 rounded-xl h-20 shadow-sm shadow-slate-400">
        <button className="flex w-full h-full justify-center items-center gap-2 text-xl bg-black rounded-lg hover:bg-slate-700 hover:text-black transition-colors duration-300">Create Room <CirclePlus/></button>
      </div>
      <div className="bg-slate-800 p-4 flex gap-2 justify-center items-center rounded-xl shadow-sm shadow-slate-400">
        Created by <a href="https://github.com/Basharkhan7776" className="text-slate-300 font-bold text-xl hover:text-slate-600">@_Bashar_Khan_</a>
      </div>
    </div>
  </>
}

function ChatBubble({ message, time, sender }: { message: string, time: string, sender: string }) {
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
          <div>
            {message}
          </div>
          <div className="flex justify-start text-[10px]">
            {time}
          </div>
        </div>
      </div>
    }
  </>
}