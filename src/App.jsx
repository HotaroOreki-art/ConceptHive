import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GraphProvider } from "./context/GraphContext.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const CreateGraph = lazy(() => import("./pages/CreateGraph.jsx"));
const GraphView = lazy(() => import("./pages/GraphView.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080a09] text-neutral-100">
      <LoadingSpinner label="Loading ConceptHive" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GraphProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/create" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create"
                element={
                  <ProtectedRoute>
                    <CreateGraph />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/graph/:graphId"
                element={
                  <ProtectedRoute>
                    <GraphView />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </GraphProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
