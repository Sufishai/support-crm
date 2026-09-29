import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreateTicket from "./pages/CreateTicket";
import TicketDetails from "./pages/TicketDetails";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <div className="app">
      <Navbar />

      <main className="main-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-ticket" element={<CreateTicket />} />
          <Route path="/tickets/:ticketId" element={<TicketDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;