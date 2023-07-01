import React from "react"
import Board from "./Board"

import { Route, Routes, MemoryRouter } from "react-router-dom";

const App = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Board />} />
      </Routes>
    </MemoryRouter>
  )
}

export default App;
