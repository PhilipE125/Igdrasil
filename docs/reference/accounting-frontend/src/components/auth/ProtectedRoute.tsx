import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCompany } from "@/contexts/CompanyContext";
import { PixelSquirrelLoader } from "@/components/PixelSquirrelLoader";

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const { companies, loadingCompanies } = useCompany();
  const location = useLocation();

  // Dev skip
  if (sessionStorage.getItem("igdrasil_skip_auth") === "true") {
    return <>{children}</>;
  }

  // Don't gate the onboarding page behind loadingCompanies — the wizard creates
  // its own company and stores page state locally.  Unmounting it mid-flow (when a
  // Supabase token refresh toggles loadingCompanies) resets the wizard to step 1.
  const isOnboarding = location.pathname === "/onboarding";
  if (loading || (user && loadingCompanies && !isOnboarding)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <PixelSquirrelLoader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to onboarding only if the user has no companies set up yet.
  // Preserve the current query string so OAuth callbacks (e.g. ?fortnox=connected)
  // survive the redirect and can be handled by OnboardingWizard.
  // On hard refresh there can be transient failures fetching companies (e.g. token hydration).
  // If we have a strong local hint that the user already has a company, don't force onboarding.
  const hasCompanyHint = Boolean(
    localStorage.getItem(`igdrasil_active_company_${user.id}`) ||
      localStorage.getItem(`igdrasil_has_company_${user.id}`) === "true",
  );
  const needsOnboarding = companies.length === 0 && !hasCompanyHint;
  const sp = new URLSearchParams(location.search);
  const oauthCallbackToSettings =
    location.pathname === "/settings" &&
    (["fortnox", "visma"] as const).some((p) => {
      const v = sp.get(p);
      return v === "connected" || v === "error";
    });

  const onboardingExemptPaths = new Set(["/", "/settings", "/profile"]);
  const shouldRedirectToOnboarding =
    needsOnboarding &&
    location.pathname !== "/onboarding" &&
    !oauthCallbackToSettings &&
    !onboardingExemptPaths.has(location.pathname);

  if (shouldRedirectToOnboarding) {
    return <Navigate to={`/onboarding${location.search}`} replace />;
  }

  return <>{children}</>;
};
