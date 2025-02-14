import React from 'react'
import './App.css'
import Routing from './routes'
import { BrowserRouter } from "react-router-dom";

function App() {

  return (
    <div>
      <BrowserRouter>
      <Routing/>
      </BrowserRouter>
    </div>
  )
}

export default App
