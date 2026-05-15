import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./features/home/Home";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import TenantListings from "./features/listings/TenantListings";
import TenantBookings from "./features/bookings/TenantBookings";
import OwnerListings from "./features/listings/OwnerListings";
import OwnerBookings from "./features/bookings/OwnerBookings";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/listings"
            element={
              <PrivateRoute>
                <TenantListings />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <TenantBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/listings"
            element={
              <PrivateRoute>
                <OwnerListings />
              </PrivateRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <PrivateRoute>
                <OwnerBookings />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
