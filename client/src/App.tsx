import "./App.css";

function App() {
  return (
    <div className="absolute aspect-video h-1/2 bg-black flex flex-col top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <div className="h-[90vw] bg-gray-900 rounded-lg m-1"></div>
      <div className="h-[10vw] bg-gray-900 rounded-lg m-1">
        <input type="text" className="h-full text-xl text-white bg-gray-900 rounded-lg p-2"/>
        <button type="submit" className="bg-white"></button>
      </div>
    </div>
  );
}

export default App;
