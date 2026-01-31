import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-4xl font-bold mb-4">Hello World!</h1>
        <p className="text-xl mb-8">Smart E-DMS Frontend Initialized</p>
        <div className="card bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
          <p className="mt-4">
            Edit <code>src/App.jsx</code> and save to test HMR
          </p>
        </div>
      </div>
    </>
  )
}

export default App
