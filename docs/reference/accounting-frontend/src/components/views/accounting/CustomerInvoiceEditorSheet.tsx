import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Plus, Settings2, Trash2 } from "lucide-react";
import { round2Sync, extractVatAmountSync } from "@/lib/accounting-engine";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  createCustomerInvoice,
  updateCustomerInvoice,
  type AccountingCustomer,
  type CustomerInvoiceItemInput,
  type CustomerInvoiceRecord,
} from "@/lib/uploadApi";
import { InvoicePreview, textToEditorDoc, type InvoicePreviewData } from "./InvoicePreview";

// ─── Template system ───────────────────────────────────────────────────────────

type InvoiceTemplate = {
  id: string;
  name: string;
  isDefault: boolean;
  currency: string;
  paymentTermsDays: number;
  includeVat: boolean;
  vatRate: number;
  includeLineItemTax: boolean;
  includeDiscount: boolean;
  includeUnits: boolean;
  includeDecimals: boolean;
  fromDetails: string;
  paymentDetails: string;
};

const BUILTIN_TEMPLATES: InvoiceTemplate[] = [
  {
    id: "default",
    name: "Default",
    isDefault: true,
    currency: "SEK",
    paymentTermsDays: 30,
    includeVat: false,
    vatRate: 25,
    includeLineItemTax: true,
    includeDiscount: false,
    includeUnits: true,
    includeDecimals: true,
    fromDetails: "",
    paymentDetails: "",
  },
  {
    id: "minimal",
    name: "Minimal",
    isDefault: false,
    currency: "SEK",
    paymentTermsDays: 14,
    includeVat: false,
    vatRate: 0,
    includeLineItemTax: false,
    includeDiscount: false,
    includeUnits: false,
    includeDecimals: true,
    fromDetails: "",
    paymentDetails: "",
  },
];

function loadTemplates(): InvoiceTemplate[] {
  try {
    const stored = localStorage.getItem("invoice-templates");
    if (stored) return JSON.parse(stored) as InvoiceTemplate[];
  } catch {
    // ignore
  }
  return BUILTIN_TEMPLATES;
}

function persistTemplates(templates: InvoiceTemplate[]) {
  try {
    localStorage.setItem("invoice-templates", JSON.stringify(templates));
  } catch {
    // ignore
  }
}

function useInvoiceTemplates() {
  const [templates, setTemplates] = useState<InvoiceTemplate[]>(loadTemplates);

  function commit(next: InvoiceTemplate[]) {
    setTemplates(next);
    persistTemplates(next);
  }

  function createTemplate(
    name: string,
    base: Omit<InvoiceTemplate, "id" | "name" | "isDefault">,
  ): InvoiceTemplate {
    const t: InvoiceTemplate = { ...base, id: crypto.randomUUID(), name, isDefault: false };
    commit([...templates, t]);
    return t;
  }

  function deleteTemplate(id: string) {
    const next = templates.filter((t) => t.id !== id);
    if (next.length === 0) return;
    commit(next);
  }

  function updateTemplate(id: string, patch: Partial<InvoiceTemplate>) {
    commit(templates.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  const defaultTemplate = templates.find((t) => t.isDefault) ?? templates[0];
  return { templates, defaultTemplate, createTemplate, deleteTemplate, updateTemplate };
}

// ─── Form types ────────────────────────────────────────────────────────────────

type EditableLineItem = {
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  vat_rate: string;
};

type InvoiceSettings = {
  currency: string;
  paymentTermsDays: number;
  includeVat: boolean;
  vatRate: number;
  includeLineItemTax: boolean;
  includeDiscount: boolean;
  includeUnits: boolean;
  includeDecimals: boolean;
};

type BooleanSettingKey =
  | "includeVat"
  | "includeLineItemTax"
  | "includeDiscount"
  | "includeUnits"
  | "includeDecimals";

const BOOL_TOGGLES: Array<{ key: BooleanSettingKey; label: string }> = [
  { key: "includeLineItemTax", label: "Per-line VAT %" },
  { key: "includeVat", label: "Invoice-level VAT" },
  { key: "includeDiscount", label: "Discount" },
  { key: "includeUnits", label: "Units column" },
  { key: "includeDecimals", label: "Decimal prices" },
];

type InvoiceFormState = InvoiceSettings & {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerOrgNumber: string;
  customerCity: string;
  customerCountryCode: string;
  customerAddress: string;
  invoiceDate: string;
  dueDate: string;
  paymentReference: string;
  ourReference: string;
  yourReference: string;
  notes: string;
  fromDetails: string;
  paymentDetails: string;
  discount: string;
  items: EditableLineItem[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function dueDateFrom(invoiceDate: string, days: number): string {
  try {
    const d = new Date(invoiceDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
  }
}

function settingsFromTemplate(template: InvoiceTemplate): InvoiceSettings {
  return {
    currency: template.currency,
    paymentTermsDays: template.paymentTermsDays,
    includeVat: template.includeVat,
    vatRate: template.vatRate,
    includeLineItemTax: template.includeLineItemTax,
    includeDiscount: template.includeDiscount,
    includeUnits: template.includeUnits,
    includeDecimals: template.includeDecimals,
  };
}

function emptyForm(template: InvoiceTemplate, customerId?: string | null): InvoiceFormState {
  const invoiceDate = todayString();
  return {
    ...settingsFromTemplate(template),
    customerId: customerId ?? "new",
    customerName: "",
    customerEmail: "",
    customerOrgNumber: "",
    customerCity: "",
    customerCountryCode: "SE",
    customerAddress: "",
    invoiceDate,
    dueDate: dueDateFrom(invoiceDate, template.paymentTermsDays),
    paymentReference: "",
    ourReference: "",
    yourReference: "",
    notes: "",
    fromDetails: template.fromDetails,
    paymentDetails: template.paymentDetails,
    discount: "",
    items: [
      {
        description: "",
        quantity: "1",
        unit: "st",
        unit_price: "",
        vat_rate: String(template.vatRate || 25),
      },
    ],
  };
}

function buildFormFromInvoice(
  invoice: CustomerInvoiceRecord,
  customers: AccountingCustomer[],
  template: InvoiceTemplate,
): InvoiceFormState {
  const customer = invoice.customer_id
    ? (customers.find((c) => c.id === invoice.customer_id) ?? null)
    : null;

  return {
    ...settingsFromTemplate(template),
    customerId: invoice.customer_id ?? "new",
    customerName: customer?.name ?? "",
    customerEmail: customer?.email ?? "",
    customerOrgNumber: customer?.org_number ?? "",
    customerCity: customer?.city ?? "",
    customerCountryCode: customer?.country_code ?? "SE",
    customerAddress: "",
    invoiceDate: invoice.invoice_date.slice(0, 10),
    dueDate: invoice.due_date.slice(0, 10),
    currency: invoice.currency,
    paymentReference: invoice.payment_reference ?? "",
    ourReference: invoice.our_reference ?? "",
    yourReference: invoice.your_reference ?? "",
    notes: invoice.notes ?? "",
    fromDetails: template.fromDetails,
    paymentDetails: template.paymentDetails,
    discount: "",
    items: invoice.items.length
      ? invoice.items.map((item) => ({
          description: item.description,
          quantity: String(item.quantity),
          unit: item.unit ?? "",
          unit_price: String(item.unit_price),
          vat_rate: String(item.vat_rate ?? 25),
        }))
      : [
          {
            description: "",
            quantity: "1",
            unit: "st",
            unit_price: "",
            vat_rate: String(template.vatRate || 25),
          },
        ],
  };
}

function parseLineItems(items: EditableLineItem[]): CustomerInvoiceItemInput[] {
  return items
    .filter((item) => item.description.trim() || Number(item.unit_price) > 0)
    .map((item) => ({
      description: item.description.trim() || "Line item",
      quantity: Number(item.quantity || "0"),
      unit: item.unit.trim() || null,
      unit_price: Number(item.unit_price || "0"),
      vat_rate: Number(item.vat_rate || "0"),
      revenue_account_number: null,
    }));
}

function calcLineTotal(unit_price: string, quantity: string): number {
  const raw = (Number(unit_price) || 0) * (Number(quantity) || 0);
  return round2Sync(raw) ?? raw;
}

function fmtCurrency(amount: number, currency: string, decimals: boolean): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(amount);
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CustomerInvoiceEditorSheet({
  open,
  onOpenChange,
  customers,
  draftInvoice,
  presetCustomerId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customers: AccountingCustomer[];
  draftInvoice?: CustomerInvoiceRecord | null;
  presetCustomerId?: string | null;
}) {
  const queryClient = useQueryClient();
  const { templates, defaultTemplate, createTemplate, updateTemplate } = useInvoiceTemplates();

  const [currentTemplateId, setCurrentTemplateId] = useState<string>(defaultTemplate.id);
  const [form, setForm] = useState<InvoiceFormState>(() => emptyForm(defaultTemplate, presetCustomerId));
  const [customerOpen, setCustomerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");

  const currentTemplate = templates.find((t) => t.id === currentTemplateId) ?? defaultTemplate;

  // Reset form whenever the sheet opens
  useEffect(() => {
    if (!open) return;
    const template = templates.find((t) => t.id === currentTemplateId) ?? defaultTemplate;

    if (draftInvoice) {
      setForm(buildFormFromInvoice(draftInvoice, customers, template));
      return;
    }

    const next = emptyForm(template, presetCustomerId);
    if (presetCustomerId) {
      const customer = customers.find((c) => c.id === presetCustomerId);
      if (customer) {
        next.customerId = customer.id;
        next.customerName = customer.name;
        next.customerEmail = customer.email ?? "";
        next.customerOrgNumber = customer.org_number ?? "";
        next.customerCity = customer.city ?? "";
        next.customerCountryCode = customer.country_code ?? "SE";
      }
    }
    setForm(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const selectedCustomer =
    form.customerId !== "new" ? (customers.find((c) => c.id === form.customerId) ?? null) : null;

  // ── Template actions ──────────────────────────────────────────────────────────

  function selectTemplate(template: InvoiceTemplate) {
    setCurrentTemplateId(template.id);
    setForm((prev) => ({
      ...prev,
      ...settingsFromTemplate(template),
      fromDetails: template.fromDetails || prev.fromDetails,
      paymentDetails: template.paymentDetails || prev.paymentDetails,
      dueDate: dueDateFrom(prev.invoiceDate, template.paymentTermsDays),
    }));
  }

  function updateSettings(patch: Partial<InvoiceSettings>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function saveSettingsToTemplate() {
    updateTemplate(currentTemplateId, {
      currency: form.currency,
      paymentTermsDays: form.paymentTermsDays,
      includeVat: form.includeVat,
      vatRate: form.vatRate,
      includeLineItemTax: form.includeLineItemTax,
      includeDiscount: form.includeDiscount,
      includeUnits: form.includeUnits,
      includeDecimals: form.includeDecimals,
      fromDetails: form.fromDetails,
      paymentDetails: form.paymentDetails,
    });
    toast({ title: "Template saved", description: `"${currentTemplate.name}" has been updated.` });
    setSettingsOpen(false);
  }

  function handleCreateTemplate() {
    if (!newTemplateName.trim()) return;
    createTemplate(newTemplateName.trim(), {
      currency: form.currency,
      paymentTermsDays: form.paymentTermsDays,
      includeVat: form.includeVat,
      vatRate: form.vatRate,
      includeLineItemTax: form.includeLineItemTax,
      includeDiscount: form.includeDiscount,
      includeUnits: form.includeUnits,
      includeDecimals: form.includeDecimals,
      fromDetails: form.fromDetails,
      paymentDetails: form.paymentDetails,
      isDefault: false,
    });
    setCreateTemplateOpen(false);
    setNewTemplateName("");
    toast({ title: "Template created", description: `"${newTemplateName.trim()}" is now available.` });
  }

  // ── Customer selector ─────────────────────────────────────────────────────────

  function handleCustomerSelect(customerId: string) {
    if (customerId === "new") {
      setForm((prev) => ({
        ...prev,
        customerId: "new",
        customerName: "",
        customerEmail: "",
        customerOrgNumber: "",
        customerCity: "",
        customerCountryCode: "SE",
        customerAddress: "",
      }));
    } else {
      const customer = customers.find((c) => c.id === customerId) ?? null;
      setForm((prev) => ({
        ...prev,
        customerId: customerId,
        customerName: customer?.name ?? "",
        customerEmail: customer?.email ?? "",
        customerOrgNumber: customer?.org_number ?? "",
        customerCity: customer?.city ?? "",
        customerCountryCode: customer?.country_code ?? "SE",
        customerAddress: "",
      }));
    }
    setCustomerOpen(false);
  }

  // ── Line items ────────────────────────────────────────────────────────────────

  function updateItem(index: number, patch: Partial<EditableLineItem>) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: "1",
          unit: "st",
          unit_price: "",
          vat_rate: String(prev.vatRate || 25),
        },
      ],
    }));
  }

  function removeItem(index: number) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((_, i) => i !== index),
    }));
  }

  // Dynamic grid for line items table
  const gridCols = useMemo(() => {
    const parts: string[] = ["minmax(0,1fr)", "52px"];
    if (form.includeUnits) parts.push("60px");
    parts.push("96px");
    if (form.includeLineItemTax) parts.push("52px");
    parts.push("96px", "32px");
    return `grid-cols-[${parts.join("_")}]`;
  }, [form.includeUnits, form.includeLineItemTax]);

  // ── Totals ────────────────────────────────────────────────────────────────────

  const lineItems = useMemo(() => parseLineItems(form.items), [form.items]);

  const totals = useMemo(() => {
    const r2 = (v: number) => round2Sync(v) ?? v;
    const subtotal = lineItems.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
    const vatTreatment = form.vatRate >= 24 ? "standard_25" : form.vatRate >= 11 ? "reduced_12" : form.vatRate >= 5 ? "reduced_6" : "exempt";
    const vat = form.includeVat ? (extractVatAmountSync(subtotal + subtotal * (form.vatRate / 100), vatTreatment) ?? r2(subtotal * (form.vatRate / 100))) : 0;
    const lineVat = form.includeLineItemTax
      ? r2(lineItems.reduce(
          (acc, item) => acc + item.quantity * item.unit_price * ((item.vat_rate ?? 0) / 100),
          0,
        ))
      : 0;
    const discount = form.includeDiscount ? Number(form.discount) || 0 : 0;
    return { subtotal: r2(subtotal), vat, lineVat, discount, total: r2(subtotal + vat + lineVat - discount) };
  }, [lineItems, form.includeVat, form.vatRate, form.includeLineItemTax, form.includeDiscount, form.discount]);

  // ── Mutation ──────────────────────────────────────────────────────────────────

  const mutation = useMutation({
    mutationFn: async () => {
      if (lineItems.length === 0) throw new Error("Add at least one invoice line.");

      if (draftInvoice) {
        return updateCustomerInvoice(draftInvoice.id, {
          due_date: form.dueDate,
          payment_reference: form.paymentReference || null,
          our_reference: form.ourReference || null,
          your_reference: form.yourReference || null,
          notes: form.notes || null,
          items: lineItems,
          entry_context_patch: { ui_origin: "accounting_customers_sheet" },
        });
      }

      return createCustomerInvoice({
        customer: selectedCustomer
          ? { id: selectedCustomer.id, partner_type: "customer" }
          : {
              partner_type: "customer",
              name: form.customerName || null,
              email: form.customerEmail || null,
              org_number: form.customerOrgNumber || null,
              city: form.customerCity || null,
              country_code: form.customerCountryCode || null,
              address: form.customerAddress || null,
            },
        invoice_date: form.invoiceDate,
        due_date: form.dueDate,
        currency: form.currency,
        payment_reference: form.paymentReference || null,
        our_reference: form.ourReference || null,
        your_reference: form.yourReference || null,
        notes: form.notes || null,
        entry_context: { ui_origin: "accounting_customers_sheet" },
        items: lineItems,
      });
    },
    onSuccess: async () => {
      toast({
        title: draftInvoice ? "Draft updated" : "Draft created",
        description: draftInvoice ? "Invoice draft was updated." : "Invoice draft was created.",
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["accounting-customers"] }),
        queryClient.invalidateQueries({ queryKey: ["customer-invoices"] }),
      ]);
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: draftInvoice ? "Could not update" : "Could not create",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  // ── Live preview ──────────────────────────────────────────────────────────────

  const previewData: InvoicePreviewData = useMemo(() => {
    const customerLines: string[] = [];
    if (form.customerName) customerLines.push(form.customerName);
    if (form.customerOrgNumber) customerLines.push(`Org: ${form.customerOrgNumber}`);
    if (form.customerEmail) customerLines.push(form.customerEmail);
    if (form.customerAddress) customerLines.push(form.customerAddress);
    if (form.customerCity)
      customerLines.push(
        `${form.customerCity}${form.customerCountryCode ? `, ${form.customerCountryCode}` : ""}`,
      );

    return {
      invoiceNumber: draftInvoice?.invoice_number ?? undefined,
      issueDate: form.invoiceDate || null,
      dueDate: form.dueDate || null,
      currency: form.currency,
      locale: "sv-SE",
      includeLineItemTax: form.includeLineItemTax,
      includeVat: form.includeVat,
      vatRate: form.vatRate,
      includeDiscount: form.includeDiscount,
      discount: Number(form.discount) || 0,
      includeUnits: form.includeUnits,
      includeDecimals: form.includeDecimals,
      lineItems: form.items
        .filter((item) => item.description.trim() || Number(item.unit_price) > 0)
        .map((item) => ({
          name: item.description || "Line item",
          quantity: Number(item.quantity) || 0,
          price: Number(item.unit_price) || 0,
          unit: item.unit || undefined,
          taxRate: Number(item.vat_rate) || 0,
        })),
      fromDetails: form.fromDetails ? textToEditorDoc(form.fromDetails) : null,
      customerDetails: customerLines.length ? textToEditorDoc(customerLines.join("\n")) : null,
      paymentDetails: form.paymentDetails ? textToEditorDoc(form.paymentDetails) : null,
      noteDetails: form.notes ? textToEditorDoc(form.notes) : null,
    };
  }, [form, draftInvoice]);

  const editorTitle = draftInvoice ? `Edit ${draftInvoice.invoice_number}` : "New Invoice";

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-[96vw] max-w-[96vw] p-0 sm:max-w-[96vw]">
          <div className="grid h-full min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(440px,520px)]">
            {/* ── Left: Document editor ─────────────────────────────────────── */}
            <div className="flex min-h-0 flex-col">
              <ScrollArea className="flex-1 min-h-0">
                <div
                  className="min-h-full p-8 md:p-10 space-y-8"
                  style={{ background: "#fcfcfc" }}
                >
                  {/* Invoice header: title + dates */}
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-[26px] font-serif leading-tight text-foreground">
                        {editorTitle}
                      </h1>
                      {draftInvoice?.invoice_number && (
                        <p className="text-[11px] text-[#878787] mt-0.5">
                          {draftInvoice.invoice_number}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#878787] w-16 text-right">Issue date</span>
                        <Input
                          type="date"
                          value={form.invoiceDate}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              invoiceDate: e.target.value,
                              dueDate: dueDateFrom(e.target.value, prev.paymentTermsDays),
                            }))
                          }
                          className="h-7 w-[136px] border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 text-right"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-[#878787] w-16 text-right">Due date</span>
                        <Input
                          type="date"
                          value={form.dueDate}
                          onChange={(e) =>
                            setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                          }
                          className="h-7 w-[136px] border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 text-right"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* From / To */}
                  <div className="grid grid-cols-2 gap-8">
                    {/* From */}
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#878787] mb-2">From</p>
                      <Textarea
                        value={form.fromDetails}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, fromDetails: e.target.value }))
                        }
                        placeholder={"Your company name\nAddress\nCity\nEmail"}
                        rows={4}
                        className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 leading-5 placeholder:text-[#C0C0C0]"
                      />
                    </div>

                    {/* To */}
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#878787] mb-2">To</p>
                      <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex items-center gap-1 text-[13px] text-foreground hover:opacity-70 transition-opacity mb-2"
                          >
                            <span>
                              {selectedCustomer?.name ||
                                form.customerName ||
                                "Select customer…"}
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[280px] p-0"
                          side="bottom"
                          align="start"
                          sideOffset={4}
                        >
                          <Command>
                            <CommandInput placeholder="Search customers…" className="h-9" />
                            <CommandList>
                              <CommandEmpty>No customers found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value="__new__"
                                  onSelect={() => handleCustomerSelect("new")}
                                >
                                  <Plus className="mr-2 h-4 w-4 text-muted-foreground" />
                                  Create new customer
                                </CommandItem>
                                {customers.map((c) => (
                                  <CommandItem
                                    key={c.id}
                                    value={c.name}
                                    onSelect={() => handleCustomerSelect(c.id)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4 shrink-0",
                                        form.customerId === c.id ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    {c.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {/* Manual entry when no customer selected */}
                      {!selectedCustomer && (
                        <div className="space-y-1">
                          {form.customerId === "new" && (
                            <>
                              <Input
                                value={form.customerName}
                                onChange={(e) =>
                                  setForm((prev) => ({ ...prev, customerName: e.target.value }))
                                }
                                placeholder="Customer name"
                                className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 placeholder:text-[#C0C0C0]"
                              />
                              <Input
                                value={form.customerEmail}
                                onChange={(e) =>
                                  setForm((prev) => ({ ...prev, customerEmail: e.target.value }))
                                }
                                placeholder="Email"
                                className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 placeholder:text-[#C0C0C0]"
                              />
                              <Input
                                value={form.customerOrgNumber}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    customerOrgNumber: e.target.value,
                                  }))
                                }
                                placeholder="Org number"
                                className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 placeholder:text-[#C0C0C0]"
                              />
                              <Input
                                value={form.customerCity}
                                onChange={(e) =>
                                  setForm((prev) => ({ ...prev, customerCity: e.target.value }))
                                }
                                placeholder="City, Country"
                                className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 placeholder:text-[#C0C0C0]"
                              />
                            </>
                          )}
                        </div>
                      )}

                      {/* Selected customer details */}
                      {selectedCustomer && (
                        <div className="text-[13px] text-foreground/70 space-y-0.5 leading-5">
                          {selectedCustomer.email && <p>{selectedCustomer.email}</p>}
                          {selectedCustomer.org_number && <p>{selectedCustomer.org_number}</p>}
                          {selectedCustomer.city && <p>{selectedCustomer.city}</p>}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Line items */}
                  <div>
                    {/* Table header */}
                    <div
                      className={cn(
                        "grid gap-3 pb-1.5 border-b border-border/70",
                        gridCols,
                      )}
                    >
                      <span className="text-[11px] text-[#878787]">Description</span>
                      <span className="text-[11px] text-[#878787] text-right">Qty</span>
                      {form.includeUnits && (
                        <span className="text-[11px] text-[#878787]">Unit</span>
                      )}
                      <span className="text-[11px] text-[#878787] text-right">Price</span>
                      {form.includeLineItemTax && (
                        <span className="text-[11px] text-[#878787] text-right">VAT%</span>
                      )}
                      <span className="text-[11px] text-[#878787] text-right">Total</span>
                      <span />
                    </div>

                    {/* Item rows */}
                    {form.items.map((item, index) => (
                      <div
                        key={index}
                        className={cn(
                          "group grid gap-3 py-1 border-b border-border/40 hover:bg-black/[0.015] transition-colors",
                          gridCols,
                        )}
                      >
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, { description: e.target.value })}
                          placeholder="Description"
                          className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 placeholder:text-[#C0C0C0]"
                        />
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, { quantity: e.target.value })}
                          className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 text-right"
                        />
                        {form.includeUnits && (
                          <Input
                            value={item.unit}
                            onChange={(e) => updateItem(index, { unit: e.target.value })}
                            placeholder="st"
                            className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 placeholder:text-[#C0C0C0]"
                          />
                        )}
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, { unit_price: e.target.value })}
                          placeholder="0"
                          className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 text-right placeholder:text-[#C0C0C0]"
                        />
                        {form.includeLineItemTax && (
                          <Input
                            type="number"
                            value={item.vat_rate}
                            onChange={(e) => updateItem(index, { vat_rate: e.target.value })}
                            className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 text-right"
                          />
                        )}
                        <div className="flex items-center justify-end text-[13px] tabular-nums text-foreground/80">
                          {fmtCurrency(
                            calcLineTotal(item.unit_price, item.quantity),
                            form.currency,
                            form.includeDecimals,
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}

                    {/* Add line button */}
                    <button
                      type="button"
                      onClick={addItem}
                      className="mt-2.5 flex items-center gap-1.5 text-[13px] text-[#878787] hover:text-foreground transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add line
                    </button>

                    {/* Summary */}
                    <div className="mt-8 flex justify-end">
                      <div className="w-[260px] space-y-1.5">
                        <div className="flex justify-between text-[13px]">
                          <span className="text-[#878787]">Subtotal</span>
                          <span className="tabular-nums">
                            {fmtCurrency(totals.subtotal, form.currency, form.includeDecimals)}
                          </span>
                        </div>

                        {form.includeDiscount && (
                          <div className="flex justify-between items-center text-[13px]">
                            <span className="text-[#878787]">Discount</span>
                            <div className="flex items-center gap-1">
                              <span className="text-[#878787] text-[11px]">−</span>
                              <Input
                                type="number"
                                value={form.discount}
                                onChange={(e) =>
                                  setForm((prev) => ({ ...prev, discount: e.target.value }))
                                }
                                placeholder="0"
                                className="h-6 w-[80px] border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 text-right placeholder:text-[#C0C0C0] tabular-nums"
                              />
                            </div>
                          </div>
                        )}

                        {form.includeVat && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-[#878787]">VAT ({form.vatRate}%)</span>
                            <span className="tabular-nums">
                              {fmtCurrency(totals.vat, form.currency, form.includeDecimals)}
                            </span>
                          </div>
                        )}

                        {form.includeLineItemTax && totals.lineVat > 0 && (
                          <div className="flex justify-between text-[13px]">
                            <span className="text-[#878787]">VAT</span>
                            <span className="tabular-nums">
                              {fmtCurrency(totals.lineVat, form.currency, form.includeDecimals)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-baseline pt-2.5 border-t border-border/70">
                          <span className="text-sm font-medium">Total</span>
                          <span className="text-[22px] tabular-nums leading-none">
                            {fmtCurrency(totals.total, form.currency, form.includeDecimals)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  {/* Payment details + Notes */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#878787] mb-2">
                        Payment Details
                      </p>
                      <Textarea
                        value={form.paymentDetails}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, paymentDetails: e.target.value }))
                        }
                        placeholder={"Bank account\nIBAN\nBIC/SWIFT"}
                        rows={3}
                        className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 leading-5 placeholder:text-[#C0C0C0]"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#878787] mb-2">Notes</p>
                      <Textarea
                        value={form.notes}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="Any additional notes…"
                        rows={3}
                        className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 leading-5 placeholder:text-[#C0C0C0]"
                      />
                    </div>
                  </div>

                  {/* References */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#878787] mb-3">
                      References
                    </p>
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        {
                          label: "Our reference",
                          key: "ourReference" as const,
                          value: form.ourReference,
                        },
                        {
                          label: "Your reference",
                          key: "yourReference" as const,
                          value: form.yourReference,
                        },
                        {
                          label: "Payment reference",
                          key: "paymentReference" as const,
                          value: form.paymentReference,
                        },
                      ].map(({ label, key, value }) => (
                        <div key={key}>
                          <span className="text-[11px] text-[#878787] block mb-1">{label}</span>
                          <Input
                            value={value}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="h-7 border-0 bg-transparent shadow-none focus-visible:ring-0 text-[13px] p-0 border-b border-border/60 rounded-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* ── Footer: template + settings + actions ── */}
              <div className="flex h-[52px] shrink-0 items-center justify-between gap-2 border-t border-border/70 bg-background px-4">
                <div className="flex items-center gap-0.5">
                  {/* Template selector */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex items-center gap-1 h-8 rounded-md px-2.5 text-[13px] hover:bg-accent/20 transition-colors"
                      >
                        <span>{currentTemplate.name}</span>
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-[200px]">
                      <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal py-1">
                        Templates
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {templates.map((t) => (
                        <DropdownMenuItem
                          key={t.id}
                          onClick={() => selectTemplate(t)}
                          className="flex items-center text-[13px]"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3.5 w-3.5 shrink-0",
                              t.id === currentTemplateId ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="flex-1">{t.name}</span>
                          {t.isDefault && (
                            <span className="text-[10px] text-muted-foreground ml-2">Default</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setCreateTemplateOpen(true)}
                        className="text-[13px]"
                      >
                        <Plus className="mr-2 h-3.5 w-3.5" />
                        Save as new template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Settings popover */}
                  <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[272px]" side="top" align="start" sideOffset={8}>
                      <div className="space-y-3">
                        <p className="text-[13px] font-medium">Invoice Settings</p>

                        {/* Currency */}
                        <div className="flex items-center justify-between">
                          <span className="text-[13px]">Currency</span>
                          <Select
                            value={form.currency}
                            onValueChange={(v) => updateSettings({ currency: v })}
                          >
                            <SelectTrigger className="h-7 w-[72px] text-[13px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["SEK", "EUR", "USD", "GBP", "NOK", "DKK"].map((c) => (
                                <SelectItem key={c} value={c} className="text-[13px]">
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Payment terms */}
                        <div className="flex items-center justify-between">
                          <span className="text-[13px]">Payment terms</span>
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              value={form.paymentTermsDays}
                              onChange={(e) =>
                                updateSettings({
                                  paymentTermsDays: Number(e.target.value) || 30,
                                })
                              }
                              className="h-7 w-[52px] text-right text-[13px]"
                            />
                            <span className="text-[13px] text-muted-foreground">days</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Boolean toggles */}
                        {BOOL_TOGGLES.map(({ key, label }) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-[13px]">{label}</span>
                            <Switch
                              checked={form[key] as boolean}
                              onCheckedChange={(v) => updateSettings({ [key]: v })}
                            />
                          </div>
                        ))}

                        {/* Invoice-level VAT rate */}
                        {form.includeVat && (
                          <div className="flex items-center justify-between">
                            <span className="text-[13px]">VAT rate (%)</span>
                            <Input
                              type="number"
                              value={form.vatRate}
                              onChange={(e) =>
                                updateSettings({ vatRate: Number(e.target.value) || 0 })
                              }
                              className="h-7 w-[52px] text-right text-[13px]"
                            />
                          </div>
                        )}

                        <Separator />

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-[13px]"
                          onClick={saveSettingsToTemplate}
                        >
                          Save to "{currentTemplate.name}"
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Cancel + Save */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending
                      ? "Saving…"
                      : draftInvoice
                        ? "Save Draft"
                        : "Create Draft"}
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Right: Live preview ─────────────────────────────────────────── */}
            <div className="flex min-h-0 flex-col border-l">
              <div className="flex h-[52px] shrink-0 items-center justify-between border-b border-border/70 px-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Preview
                </span>
                <span className="text-[11px] text-muted-foreground">{form.currency}</span>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden">
                <InvoicePreview data={previewData} />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Create template dialog */}
      <Dialog open={createTemplateOpen} onOpenChange={setCreateTemplateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save as new template</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Template name"
              onKeyDown={(e) => e.key === "Enter" && handleCreateTemplate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateTemplateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={!newTemplateName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
