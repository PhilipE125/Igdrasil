import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  AuthContextStub,
  CompanyContextStub,
  buildAuthValue,
  buildCompanyValue,
  mockUser,
  mockCompany,
} from "@/test/helpers";

vi.mock("@/lib/supabase");
vi.mock("@/lib/runtimeConfig");
vi.mock("@/components/PixelSquirrelLoader", () => ({
  PixelSquirrelLoader: () => <div data-testid="loading-spinner" />,
}));

// ── Render helper ────────────────────────────────────────────────────────────

function renderRoute({
  path = "/dashboard",
  authValue = buildAuthValue(),
  companyValue = buildCompanyValue(),
}: {
  path?: string;
  authValue?: ReturnType<typeof buildAuthValue>;
  companyValue?: ReturnType<typeof buildCompanyValue>;
} = {}) {
  return render(
    <AuthContextStub value={authValue}>
      <CompanyContextStub value={companyValue}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/auth" element={<div>auth-page</div>} />
            <Route path="/onboarding" element={<div>onboarding-page</div>} />
            <Route
              path="*"
              element={
                <ProtectedRoute>
                  <div>protected-content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </CompanyContextStub>
    </AuthContextStub>,
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

// ── Loading states ───────────────────────────────────────────────────────────

describe("loading", () => {
  it("shows neither auth-page nor protected-content while auth is loading", () => {
    renderRoute({ authValue: buildAuthValue({ loading: true }) });
    expect(screen.queryByText("auth-page")).toBeNull();
    expect(screen.queryByText("protected-content")).toBeNull();
  });

  it("shows neither auth-page nor protected-content while companies are loading", () => {
    renderRoute({
      authValue: buildAuthValue({ user: mockUser() }),
      companyValue: buildCompanyValue({ loadingCompanies: true }),
    });
    expect(screen.queryByText("auth-page")).toBeNull();
    expect(screen.queryByText("protected-content")).toBeNull();
  });
});

// ── Auth gate ────────────────────────────────────────────────────────────────

describe("auth gate", () => {
  it("redirects to /auth when no user", () => {
    renderRoute({ authValue: buildAuthValue({ user: null }) });
    expect(screen.getByText("auth-page")).toBeTruthy();
    expect(screen.queryByText("protected-content")).toBeNull();
  });

  it("renders protected content when user has companies", () => {
    renderRoute({
      authValue: buildAuthValue({ user: mockUser() }),
      companyValue: buildCompanyValue({ companies: [mockCompany()] }),
    });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("redirects to onboarding when user has no companies and no localStorage hint", () => {
    renderRoute({
      path: "/dashboard",
      authValue: buildAuthValue({ user: mockUser() }),
      companyValue: buildCompanyValue({ companies: [] }),
    });
    expect(screen.getByText("onboarding-page")).toBeTruthy();
  });
});

// ── Onboarding exemptions ────────────────────────────────────────────────────

describe("onboarding exemptions", () => {
  const noCompanyAuth = buildAuthValue({ user: mockUser() });
  const noCompany = buildCompanyValue({ companies: [] });

  it("exempts /settings from onboarding redirect", () => {
    renderRoute({ path: "/settings", authValue: noCompanyAuth, companyValue: noCompany });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("exempts /profile from onboarding redirect", () => {
    renderRoute({ path: "/profile", authValue: noCompanyAuth, companyValue: noCompany });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("exempts root / from onboarding redirect", () => {
    renderRoute({ path: "/", authValue: noCompanyAuth, companyValue: noCompany });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("exempts /settings with OAuth params from onboarding redirect", () => {
    renderRoute({
      path: "/settings?fortnox=connected",
      authValue: noCompanyAuth,
      companyValue: noCompany,
    });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("uses active-company localStorage hint to skip onboarding", () => {
    const user = mockUser();
    localStorage.setItem(`igdrasil_active_company_${user.id}`, "company-99");
    renderRoute({
      path: "/dashboard",
      authValue: buildAuthValue({ user }),
      companyValue: buildCompanyValue({ companies: [] }),
    });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("uses has-company localStorage hint to skip onboarding", () => {
    const user = mockUser();
    localStorage.setItem(`igdrasil_has_company_${user.id}`, "true");
    renderRoute({
      path: "/dashboard",
      authValue: buildAuthValue({ user }),
      companyValue: buildCompanyValue({ companies: [] }),
    });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });
});

// ── Non-exempt paths ─────────────────────────────────────────────────────────

describe("non-exempt paths", () => {
  it("redirects /dashboard to onboarding when no companies and no hints", () => {
    renderRoute({
      path: "/dashboard",
      authValue: buildAuthValue({ user: mockUser() }),
      companyValue: buildCompanyValue({ companies: [] }),
    });
    expect(screen.getByText("onboarding-page")).toBeTruthy();
  });
});

// ── Dev skip flag ────────────────────────────────────────────────────────────

describe("dev skip", () => {
  it("bypasses auth when sessionStorage flag is 'true'", () => {
    sessionStorage.setItem("igdrasil_skip_auth", "true");
    renderRoute({ authValue: buildAuthValue({ user: null }) });
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("does NOT bypass auth when sessionStorage flag is 'false'", () => {
    sessionStorage.setItem("igdrasil_skip_auth", "false");
    renderRoute({ authValue: buildAuthValue({ user: null }) });
    expect(screen.getByText("auth-page")).toBeTruthy();
  });
});

// ── Dynamic state changes ────────────────────────────────────────────────────

describe("state transitions", () => {
  it("transitions to protected-content when user arrives after loading", () => {
    const { rerender } = renderRoute({
      authValue: buildAuthValue({ loading: true }),
      companyValue: buildCompanyValue({ companies: [mockCompany()] }),
    });
    expect(screen.queryByText("protected-content")).toBeNull();

    rerender(
      <AuthContextStub value={buildAuthValue({ user: mockUser(), loading: false })}>
        <CompanyContextStub value={buildCompanyValue({ companies: [mockCompany()] })}>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <Routes>
              <Route path="/auth" element={<div>auth-page</div>} />
              <Route path="/onboarding" element={<div>onboarding-page</div>} />
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <div>protected-content</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </CompanyContextStub>
      </AuthContextStub>,
    );
    expect(screen.getByText("protected-content")).toBeTruthy();
  });

  it("transitions to auth-page when user logs out", () => {
    const { rerender } = renderRoute({
      authValue: buildAuthValue({ user: mockUser() }),
      companyValue: buildCompanyValue({ companies: [mockCompany()] }),
    });
    expect(screen.getByText("protected-content")).toBeTruthy();

    rerender(
      <AuthContextStub value={buildAuthValue({ user: null })}>
        <CompanyContextStub value={buildCompanyValue()}>
          <MemoryRouter initialEntries={["/dashboard"]}>
            <Routes>
              <Route path="/auth" element={<div>auth-page</div>} />
              <Route path="/onboarding" element={<div>onboarding-page</div>} />
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <div>protected-content</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </MemoryRouter>
        </CompanyContextStub>
      </AuthContextStub>,
    );
    expect(screen.getByText("auth-page")).toBeTruthy();
  });
});
