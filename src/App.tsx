import { Routes, Route, BrowserRouter } from "react-router-dom"
import Login from "./pages/auth/Login"
import ForgotPassword from "./pages/auth/forgot-password"
import ResetPassword from "./pages/auth/reset-password"
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
import ResolutionCreate from "./pages/admin/resolution/create"
import { AdminRoute } from "./components/AdminRoutes"
import { UserRoute } from "./components/PrivateRoutes"
import UserDashboard from "./pages/user/dashboard"
import Award from "./pages/admin/award"
import AwardShow from "./pages/admin/award/show"
import AwardEdit from "./pages/admin/award/edit"
import UserManagement from "./pages/admin/user"
import UserTechTransfer from "./pages/user/tech-transfer"
import UserTechnTransferShow from "./pages/user/tech-transfer/show"
import UserTechnTransferEdit from "./pages/user/tech-transfer/edit"
import UserTechTransferCreate from "./pages/user/tech-transfer/create"
import TechTransferReport from "./pages/admin/reports/tech-transfer"
import ImpactAssessment from "./pages/admin/impct-assessment"
import ImpactAssessmentShow from "./pages/admin/impct-assessment/show"
import ImpactAssessmentEdit from "./pages/admin/impct-assessment/edit"
import Modality from "./pages/admin/modalities"
import ModalityShow from "./pages/admin/modalities/show"
import ModalityEdit from "./pages/admin/modalities/edit"
import UserAwards from "./pages/user/awards"
import UserAwardsCreate from "./pages/user/awards/create"
import UserAwardsEdit from "./pages/user/awards/edit"
import UserAwardShow from "./pages/user/awards/show"
import UserModalities from "./pages/user/modalities"
import UserModalitiesCreate from "./pages/user/modalities/create"
import UserImpactAssessments from "./pages/user/impact-assessments"
import UserImpactAssessmentsCreate from "./pages/user/impact-assessments/create"
import UserImpactAssessmentEdit from "./pages/user/impact-assessments/edit"
import UserImpactAssessmentShow from "./pages/user/impact-assessments/show"
import UserModalityShow from "./pages/user/modalities/show"
import UserModalityEdit from "./pages/user/modalities/edit"
import AwardReport from "./pages/admin/reports/award"
import ResolutionReport from "./pages/admin/reports/resolution"
import ModalityReport from "./pages/admin/reports/modalities"
import ImpactAssessmentReport from "./pages/admin/reports/impct-assessment"
import EngagementReport from "./pages/admin/reports/engagement"
import NotFound from "./pages/NotFound"
import CreateUser from "./pages/admin/user/create"
import ShowUser from "./pages/admin/user/show"
import EditUser from "./pages/admin/user/edit"
import UsersReport from "./pages/admin/reports/users"
import AuditTrailIndex from "./pages/admin/reports/audit-trail"
import UserEngagements from "./pages/user/engagements"
import UserEngagementsCreate from "./pages/user/engagements/create"
import UserEngagementsEdit from "./pages/user/engagements/edit"
import UserEngagementsShow from "./pages/user/engagements/show"
import Engagement from "./pages/admin/engagement"
import EngagementShow from "./pages/admin/engagement/show"
import EngagementEdit from "./pages/admin/engagement/edit"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="technology-transfer">
              <Route index element={<TechnologyTransfer />} />
              <Route path=":id/edit" element={<TechnologyTransferEdit />} />
              <Route path=":id" element={<TechnologyTransferShow />} />
            </Route>
            <Route path="engagements">
              <Route index element={<Engagement />} />
              <Route path=":id/edit" element={<EngagementEdit />} />
              <Route path=":id" element={<EngagementShow />} />
            </Route>
            <Route path="awards-recognition">
              <Route index element={<Award />} />
              <Route path=":id/edit" element={<AwardEdit />} />
              <Route path=":id" element={<AwardShow />} />
            </Route>
            <Route path="impact-assessment">
              <Route index element={<ImpactAssessment />} />
              <Route path=":id/edit" element={<ImpactAssessmentEdit />} />
              <Route path=":id" element={<ImpactAssessmentShow />} />
            </Route>
            <Route path="modalities">
              <Route index element={<Modality />} />
              <Route path=":id/edit" element={<ModalityEdit />} />
              <Route path=":id" element={<ModalityShow />} />
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
            </Route>
            <Route path="users">
              <Route index element={<UserManagement />} />
              <Route path="create" element={<CreateUser />} />
              <Route path=":id/edit" element={<EditUser />} />
              <Route path=":id" element={<ShowUser />} />
            </Route>
            <Route path="report">
              <Route path="technology-transfers" element={<TechTransferReport />} />
              <Route path="awards" element={<AwardReport />} />
              <Route path="resolutions" element={<ResolutionReport />} />
              <Route path="modalities" element={<ModalityReport />} />
              <Route path="impact-assessments" element={<ImpactAssessmentReport />} />
              <Route path="engagements" element={<EngagementReport />} />
              <Route path="users" element={<UsersReport />} />
              <Route path="audit-trail" element={<AuditTrailIndex />} />
            </Route>
          </Route>
          <Route path="/user" element={<UserRoute />}>
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="technology-transfer">
              <Route index element={<UserTechTransfer />} />
              <Route path="create" element={<UserTechTransferCreate />} />
              <Route path=":id/edit" element={<UserTechnTransferEdit />} />
              <Route path=":id" element={<UserTechnTransferShow />} />
            </Route>
            <Route path="awards-recognition">
              <Route index element={<UserAwards />} />
              <Route path="create" element={<UserAwardsCreate />} />
              <Route path=":id/edit" element={<UserAwardsEdit />} />
              <Route path=":id" element={<UserAwardShow />} />
            </Route>
            <Route path="engagements">
              <Route index element={<UserEngagements />} />
              <Route path="create" element={<UserEngagementsCreate />} />
              <Route path=":id/edit" element={<UserEngagementsEdit />} />
              <Route path=":id" element={<UserEngagementsShow />} />
            </Route>
            <Route path="impact-assessment">
              <Route index element={<UserImpactAssessments />} />
              <Route path="create" element={<UserImpactAssessmentsCreate />} />
              <Route path=":id/edit" element={<UserImpactAssessmentEdit />} />
              <Route path=":id" element={<UserImpactAssessmentShow />} />
            </Route>
            <Route path="modalities">
              <Route index element={<UserModalities />} />
              <Route path="create" element={<UserModalitiesCreate />} />
              <Route path=":id/edit" element={<UserModalityEdit />} />
              <Route path=":id" element={<UserModalityShow />} />
            </Route>
          </Route>
          {/* Catch all unmatched routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
