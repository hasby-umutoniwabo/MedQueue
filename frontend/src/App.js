import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">MedQueue</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Med<span className="text-blue-600">Queue</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Smart healthcare queue management for Rwanda
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">For Patients</h3>
              <p className="text-gray-600 mb-4">Join the queue and track your position in real-time</p>
              <button className="btn-primary w-full">Join Queue</button>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">For Staff</h3>
              <p className="text-gray-600 mb-4">Manage queues and serve patients efficiently</p>
              <button className="btn-secondary w-full">Staff Login</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;