function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          CareerForge AI - Test Page
        </h1>
        <p className="text-gray-600">
          If you can see this, React is working correctly!
        </p>
        <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
          <p className="text-green-700 font-medium">✅ Frontend Status: Working</p>
          <p className="text-sm text-green-600 mt-1">
            Time: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
