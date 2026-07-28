import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { FileStoreProvider } from "@/contexts/FileStoreContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CompanyProvider } from "@/contexts/CompanyContext";
import { ChatSessionProvider } from "@/contexts/ChatSessionContext";
import { TimerProvider } from "@/contexts/TimerContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { Agentation } from "agentation";
import Dashboard from "./pages/Dashboard";
import Bookkeeping from "./pages/Bookkeeping";
import PipelineBuilder from "./pages/PipelineBuilder";
import AccountingAutomations from "./pages/AccountingAutomations";
import AccountingAutomationLegacy from "./pages/AccountingAutomationLegacy";
import AccountingAutomationReview from "./pages/AccountingAutomationReview";
import AccountingCustomers from "./pages/AccountingCustomers";
import AccountingSuppliers from "./pages/AccountingSuppliers";
import AccountingEmployees from "./pages/AccountingEmployees";
import AccountingLedger from "./pages/AccountingLedger";
import FileArchive from "./pages/FileArchive";
import Modules from "./pages/Modules";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import BankTransactions from "./pages/BankTransactions";
import CardRules from "./pages/CardRules";
import Analytics from "./pages/Analytics";
import AuditTrail from "./pages/AuditTrail";
import TimeTracking from "./pages/TimeTracking";
import ReportsFinancial from "./pages/ReportsFinancial";
import ReportsRegulatory from "./pages/ReportsRegulatory";
import ReportsCustom from "./pages/ReportsCustom";

// Settings sub-pages
import { CompanyProfileSettings } from "@/components/settings/CompanyProfileSettings";
import { UserProfileSettings } from "@/components/settings/UserProfileSettings";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { UsageSettings } from "@/components/settings/UsageSettings";
import { DashboardSettings } from "@/components/settings/DashboardSettings";
import { AutomationsSettings } from "@/components/settings/AutomationsSettings";

const queryClient = new QueryClient();
const routerBaseName =
  import.meta.env.BASE_URL === "/"
    ? "/"
    : import.meta.env.BASE_URL.replace(/\/$/, "");

const App = () => (
  <>
  {import.meta.env.DEV && <Agentation />}
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={routerBaseName}>
        <AuthProvider>
          <CompanyProvider>
            <RealtimeProvider>
            <TimerProvider>
            <FileStoreProvider>
            <ChatSessionProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
                <Route path="/chat" element={<Navigate to="/" replace />} />
                <Route path="/accounting" element={<Navigate to="/accounting/automations" replace />} />
                <Route path="/accounting/automations" element={<ProtectedRoute><AccountingAutomations /></ProtectedRoute>} />
                <Route path="/accounting/automations/review" element={<ProtectedRoute><AccountingAutomationReview /></ProtectedRoute>} />
                <Route path="/accounting/automations/legacy" element={<ProtectedRoute><AccountingAutomationLegacy /></ProtectedRoute>} />
                <Route path="/accounting/customers" element={<ProtectedRoute><AccountingCustomers /></ProtectedRoute>} />
                <Route path="/accounting/suppliers" element={<ProtectedRoute><AccountingSuppliers /></ProtectedRoute>} />
                <Route path="/accounting/employees" element={<ProtectedRoute><AccountingEmployees /></ProtectedRoute>} />
                <Route path="/accounting/employees/:id" element={<ProtectedRoute><AccountingEmployees /></ProtectedRoute>} />
                <Route path="/accounting/employees/salary" element={<ProtectedRoute><AccountingEmployees /></ProtectedRoute>} />
                <Route path="/accounting/ledger" element={<ProtectedRoute><AccountingLedger /></ProtectedRoute>} />
                <Route path="/automations" element={<Navigate to="/accounting/automations" replace />} />
                <Route path="/automations/pipeline" element={<ProtectedRoute><PipelineBuilder /></ProtectedRoute>} />
                <Route path="/automations/review" element={<Navigate to="/accounting/automations/review" replace />} />
                <Route path="/automations/card-rules" element={<Navigate to="/settings/automations" replace />} />
                <Route path="/automations/bank-matching" element={<Navigate to="/accounting/automations" replace />} />
                <Route path="/ledger" element={<Navigate to="/accounting/ledger" replace />} />
                <Route path="/analytics" element={<Navigate to="/reports/custom" replace />} />
                <Route path="/reports" element={<Navigate to="/reports/financial" replace />} />
                <Route path="/reports/financial" element={<ProtectedRoute><ReportsFinancial /></ProtectedRoute>} />
                <Route path="/reports/regulatory" element={<ProtectedRoute><ReportsRegulatory /></ProtectedRoute>} />
                <Route path="/reports/custom" element={<ProtectedRoute><ReportsCustom /></ProtectedRoute>} />
                <Route path="/files" element={<ProtectedRoute><FileArchive /></ProtectedRoute>} />
                <Route path="/bank-transactions" element={<ProtectedRoute><BankTransactions /></ProtectedRoute>} />
                <Route path="/audit-trail" element={<ProtectedRoute><AuditTrail /></ProtectedRoute>} />
                <Route path="/time-tracking" element={<ProtectedRoute><TimeTracking /></ProtectedRoute>} />
                <Route path="/employees" element={<Navigate to="/accounting/employees" replace />} />
                <Route path="/employees/:id" element={<Navigate to="/accounting/employees" replace />} />
                <Route path="/employees/salary" element={<Navigate to="/accounting/employees/salary" replace />} />

                {/* Settings with sub-page routing */}
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/settings/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardSettings />} />
                  <Route path="company" element={<CompanyProfileSettings />} />
                  <Route path="user" element={<UserProfileSettings />} />
                  <Route path="integrations" element={<IntegrationsSettings />} />
                  <Route path="api-keys" element={<IntegrationsSettings />} />
                  <Route path="telegram" element={<IntegrationsSettings />} />
                  <Route path="automations" element={<AutomationsSettings />} />
                  <Route path="usage" element={<UsageSettings />} />
                </Route>

                {/* Redirect old /profile to /settings/user */}
                <Route path="/profile" element={<Navigate to="/settings/user" replace />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </ChatSessionProvider>
            </FileStoreProvider>
            </TimerProvider>
            </RealtimeProvider>
          </CompanyProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </>
);

export default App;
