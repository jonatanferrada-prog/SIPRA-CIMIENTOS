import React from "react";
import { Routes, Route } from "react-router-dom";

import AppShell from "./layouts/AppShell";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Events from "./pages/Events";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}