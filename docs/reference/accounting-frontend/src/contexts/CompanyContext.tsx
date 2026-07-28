import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  listCompanies,
  createCompany as apiCreateCompany,
  setActiveCompanyId,
  type CreateCompanyOptions,
} from "@/lib/uploadApi";

export interface Company {
  id: string;
  name: string;
  org_number: string | null;
  created_at: string;
  updated_at: string;
}

interface CompanyContextType {
  companies: Company[];
  activeCompany: Company | null;
  setActiveCompany: (company: Company) => void;
  createCompany: (opts: CreateCompanyOptions) => Promise<Company>;
  refreshCompanies: () => Promise<void>;
  loadingCompanies: boolean;
}

export const CompanyContext = createContext<CompanyContextType | null>(null);

function storageKey(userId: string) {
  return `igdrasil_active_company_${userId}`;
}

function hasCompanyKey(userId: string) {
  return `igdrasil_has_company_${userId}`;
}

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompanyState] = useState<Company | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  const refreshCompanies = useCallback(async () => {
    if (!user) return;
    try {
      let list = await listCompanies();
      // Hard-refresh edge case: if the first request returns an empty list due to
      // transient auth/network conditions, retry once before treating it as "no companies".
      if (list.length === 0) {
        await new Promise((r) => setTimeout(r, 400));
        list = await listCompanies();
      }

      setCompanies(list);

      // Restore previously active company or fall back to first.
      const savedId = localStorage.getItem(storageKey(user.id));
      const restored = savedId ? list.find((c) => c.id === savedId) : null;
      const next = restored ?? list[0] ?? null;

      if (list.length > 0) {
        localStorage.setItem(hasCompanyKey(user.id), "true");
      } else {
        localStorage.removeItem(hasCompanyKey(user.id));
      }

      setActiveCompanyState((prev) => {
        // Avoid update if same id, avoids triggering FileStore reload.
        if (prev?.id === next?.id) return prev;
        return next;
      });
      if (next) {
        setActiveCompanyId(next.id);
        // Persist hint even if user never manually switched companies.
        localStorage.setItem(storageKey(user.id), next.id);
      } else {
        setActiveCompanyId(null);
      }
    } catch (err) {
      console.error("Failed to load companies", err);
    } finally {
      setLoadingCompanies(false);
    }
  }, [user]);

  // Reload when user changes (login/logout)
  useEffect(() => {
    if (!user) {
      setCompanies([]);
      setActiveCompanyState(null);
      setActiveCompanyId(null);
      setLoadingCompanies(false);
      return;
    }
    setLoadingCompanies(true);
    void refreshCompanies();
  }, [user, refreshCompanies]);

  const setActiveCompany = useCallback(
    (company: Company) => {
      setActiveCompanyState(company);
      setActiveCompanyId(company.id);
      if (user) {
        localStorage.setItem(storageKey(user.id), company.id);
      }
    },
    [user],
  );

  const createCompany = useCallback(
    async (opts: CreateCompanyOptions): Promise<Company> => {
      const created = await apiCreateCompany(opts);
      // Add the new company directly to state instead of re-fetching — avoids
      // the race condition where a re-fetch returns an empty list transiently.
      setCompanies((prev) => [...prev, created]);
      if (user) {
        localStorage.setItem(hasCompanyKey(user.id), "true");
      }
      setActiveCompany(created);
      return created;
    },
    [setActiveCompany, user],
  );

  return (
    <CompanyContext.Provider
      value={{
        companies,
        activeCompany,
        setActiveCompany,
        createCompany,
        refreshCompanies,
        loadingCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
