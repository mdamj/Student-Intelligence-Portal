import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SignUp from "./Components/signup";
import SignIn from "./Components/signin";

function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <div>
      <h1>
        Welcome {user?.name}
      </h1>

      <p>
        Student Placement Dashboard
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/signin" />}
        />

        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/signin"
          element={<SignIn />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;