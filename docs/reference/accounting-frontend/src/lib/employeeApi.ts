/**
 * Employee module API client.
 */
import { authenticatedApiRequest } from "./uploadApi";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string | null;
  personnummer: string | null;
  email: string | null;
  bank_name: string | null;
  clearing_number: string | null;
  account_number: string | null;
  card_rule_id: string | null;
  card_last_four: string | null;
  salary_type: "hourly" | "monthly" | null;
  hourly_rate: number | null;
  gross_salary: number | null;
  tax_rate: number;
  profile_picture_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeCreate {
  first_name: string;
  last_name: string;
  role?: string;
  personnummer?: string;
  email?: string;
  bank_name?: string;
  clearing_number?: string;
  account_number?: string;
  card_rule_id?: string;
  salary_type?: "hourly" | "monthly";
  hourly_rate?: number;
  gross_salary?: number;
  tax_rate?: number;
}

export type EmployeeUpdate = Partial<EmployeeCreate>;

export interface WagePeriod {
  id: string;
  employee_id: string;
  period_year: number;
  period_month: number;
  raw_input_text: string | null;
  structured_data: Record<string, unknown> | null;
  hours_worked: number | null;
  gross_pay: number | null;
  tax_deduction: number | null;
  net_pay: number | null;
  own_expenses: number;
  other_costs: number;
  status: "draft" | "confirmed" | "sent";
  payslip_s3_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeeWageStatus {
  employee_id: string;
  first_name: string;
  last_name: string;
  salary_type: string | null;
  wage_period: WagePeriod | null;
}

export interface SalaryOverview {
  period_year: number;
  period_month: number;
  employees: EmployeeWageStatus[];
  all_confirmed: boolean;
}

export interface BankInfo {
  name: string;
  clearing_ranges: string[];
}

export interface Expense {
  id: string;
  s3_key: string;
  original_filename: string;
  extracted_text: string;
  created_at: string;
  amount: number | null;
  description: string;
}

// ─── Employee CRUD ──────────────────────────────────────────────────────────

export const listEmployees = () =>
  authenticatedApiRequest<Employee[]>("/employees");

export const getEmployee = (id: string) =>
  authenticatedApiRequest<Employee>(`/employees/${id}`);

export const createEmployee = (data: EmployeeCreate) =>
  authenticatedApiRequest<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateEmployee = (id: string, data: EmployeeUpdate) =>
  authenticatedApiRequest<Employee>(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteEmployee = (id: string) =>
  authenticatedApiRequest<void>(`/employees/${id}`, { method: "DELETE" });

// ─── Profile picture ────────────────────────────────────────────────────────

export const presignProfilePicture = (id: string) =>
  authenticatedApiRequest<{ presigned_url: string; s3_key: string }>(
    `/employees/${id}/profile-picture`,
    { method: "POST" },
  );

// ─── Expenses ───────────────────────────────────────────────────────────────

export const listEmployeeExpenses = (id: string, search?: string) =>
  authenticatedApiRequest<Expense[]>(
    `/employees/${id}/expenses${search ? `?search=${encodeURIComponent(search)}` : ""}`,
  );

// ─── Wage periods ───────────────────────────────────────────────────────────

export const listWagePeriods = (employeeId: string) =>
  authenticatedApiRequest<WagePeriod[]>(`/employees/${employeeId}/wage-periods`);

export const createWagePeriod = (
  employeeId: string,
  data: { period_year: number; period_month: number; raw_input_text?: string },
) =>
  authenticatedApiRequest<WagePeriod>(`/employees/${employeeId}/wage-periods`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateWagePeriod = (
  employeeId: string,
  wpId: string,
  data: Partial<WagePeriod>,
) =>
  authenticatedApiRequest<WagePeriod>(
    `/employees/${employeeId}/wage-periods/${wpId}`,
    { method: "PUT", body: JSON.stringify(data) },
  );

export const parseWageText = (employeeId: string, wpId: string) =>
  authenticatedApiRequest<{
    structured_data: Record<string, unknown>;
    hours_worked: number | null;
    gross_pay: number | null;
    tax_deduction: number | null;
    net_pay: number | null;
    own_expenses: number;
  }>(`/employees/${employeeId}/wage-periods/${wpId}/parse`, { method: "POST" });

export const generatePayslip = (employeeId: string, wpId: string) =>
  authenticatedApiRequest<{ status: string; s3_key: string; email_sent: boolean }>(
    `/employees/${employeeId}/wage-periods/${wpId}/payslip`,
    { method: "POST" },
  );

export const downloadPayslip = (employeeId: string, wpId: string) =>
  authenticatedApiRequest<{ download_url: string }>(
    `/employees/${employeeId}/wage-periods/${wpId}/payslip`,
  );

// ─── Salary management ─────────────────────────────────────────────────────

export const getSalaryOverview = (year: number, month: number) =>
  authenticatedApiRequest<SalaryOverview>(
    `/employees/salary-management/${year}/${month}`,
  );

// ─── Employer declaration ───────────────────────────────────────────────────

export const generateDeclaration = (year: number, month: number) =>
  authenticatedApiRequest<{ id: string; status: string }>(
    `/employees/employer-declaration/${year}/${month}/generate`,
    { method: "POST" },
  );

export const downloadDeclaration = async (year: number, month: number) => {
  const response = await authenticatedApiRequest<Response>(
    `/employees/employer-declaration/${year}/${month}/download`,
  );
  return response;
};

// ─── Email preview ──────────────────────────────────────────────────────────

export interface PayslipEmailRecipient {
  employee_id: string;
  name: string;
  email: string | null;
  has_email: boolean;
  status: string;
  already_sent: boolean;
}

export interface PayslipEmailPreview {
  sender_email: string;
  sender_configured: boolean;
  recipients: PayslipEmailRecipient[];
  total_recipients: number;
  recipients_with_email: number;
  note: string;
}

export const getPayslipEmailPreview = (year: number, month: number) =>
  authenticatedApiRequest<PayslipEmailPreview>(
    `/employees/payslip-email-preview/${year}/${month}`,
  );

// ─── Banks ──────────────────────────────────────────────────────────────────

export const listBanks = () =>
  authenticatedApiRequest<BankInfo[]>("/employees/banks");
