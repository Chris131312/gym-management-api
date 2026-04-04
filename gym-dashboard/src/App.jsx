import React from "react";
import { Dumbbell } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-10 rounded-xl shadow-xl text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <Dumbbell className="w-12 h-12 text-blue-600" strokeWidth={2} />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Gym Managment OS
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          Front end configurado con Tailwind CSS y Lucide Icons.
        </p>

        <button className="w-full bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
          Entrar al Sistema
        </button>
      </div>
    </div>
  );
}

export default App;
