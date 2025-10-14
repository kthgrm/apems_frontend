import { Routes, Route, BrowserRouter } from "react-router-dom"
import Login from "./pages/auth/Login"
import AdminDashboard from "./pages/admin"
import { AuthProvider } from "./contexts/AuthContext"
import TechnologyTransfer from "./pages/admin/tech-transfer/index"
import TechnologyTransferShow from "./pages/admin/tech-transfer/show"
import TechnologyTransferEdit from "./pages/admin/tech-transfer/edit"
import College from "./pages/admin/college"
import CollegeShow from "./pages/admin/college/show"
import CollegeEdit from "./pages/admin/college/edit"
import CollegeCreate from "./pages/admin/college/create"
import Campus from "./pages/admin/campus"
import CampusCreate from "./pages/admin/campus/create"
import CampusEdit from "./pages/admin/campus/edit"
import CampusShow from "./pages/admin/campus/show"
import Resolution from "./pages/admin/resolution"
import ResolutionShow from "./pages/admin/resolution/show"
import ResolutionCreate from "./pages/admin/resolution/create"
import ResolutionEdit from "./pages/admin/resolution/edit"
import { AdminRoute } from "./components/AdminRoutes"
import { UserRoute } from "./components/PrivateRoutes"
import UserDashboard from "./pages/user/dashboard"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="technology-transfer">
              <Route index element={<TechnologyTransfer />} />
              <Route path=":id/edit" element={<TechnologyTransferEdit />} />
              <Route path=":id" element={<TechnologyTransferShow />} />
            </Route>
            <Route path="college">
              <Route index element={<College />} />
              <Route path="create" element={<CollegeCreate />} />
              <Route path=":id/edit" element={<CollegeEdit />} />
              <Route path=":id" element={<CollegeShow />} />
            </Route>
            <Route path="campus">
              <Route index element={<Campus />} />
              <Route path="create" element={<CampusCreate />} />
              <Route path=":id/edit" element={<CampusEdit />} />
              <Route path=":id" element={<CampusShow />} />
            </Route>
            <Route path="resolution">
              <Route index element={<Resolution />} />
              <Route path="create" element={<ResolutionCreate />} />
              <Route path=":id/edit" element={<ResolutionEdit />} />
              <Route path=":id" element={<ResolutionShow />} />
            </Route>
          </Route>
          <Route path="/user" element={<UserRoute />}>
            <Route path="dashboard" element={<UserDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
