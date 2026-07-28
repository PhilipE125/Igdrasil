import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { getCustomerDetail, updateCustomer } from "@/lib/uploadApi";
import type { CustomerDetail, CustomerUpdateInput } from "@/lib/uploadApi";

interface CustomerDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

export function CustomerDetailSheet({ open, onOpenChange, customerId }: CustomerDetailSheetProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<CustomerDetail>>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["accounting-customer-detail", customerId],
    queryFn: () => getCustomerDetail(customerId!),
    enabled: open && !!customerId,
  });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const set = (field: keyof CustomerDetail, value: unknown) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const mutation = useMutation({
    mutationFn: (payload: CustomerUpdateInput) => updateCustomer(customerId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounting-customer-detail", customerId] });
      queryClient.invalidateQueries({ queryKey: ["accounting-customers"] });
      toast({ title: "Customer updated" });
      onOpenChange(false);
    },
    onError: () => {
      toast({ title: "Failed to save", description: "Please try again.", variant: "destructive" });
    },
  });

  function handleSave() {
    const { id, created_at, updated_at, fortnox_customer_number, ...payload } = form as CustomerDetail;
    mutation.mutate(payload);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[520px] max-w-full flex-col p-0 sm:max-w-[520px]">
        {/* Header */}
        <div className="flex h-[52px] shrink-0 items-center justify-between border-b px-4">
          <h2 className="text-sm font-semibold">Edit Customer</h2>
          {data && (
            <Badge variant={form.is_active ? "default" : "secondary"}>
              {form.is_active ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-5 p-4">

              {/* ── General ── */}
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">General</p>
                <Field label="Name">
                  <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Org. number">
                    <Input value={form.org_number ?? ""} onChange={(e) => set("org_number", e.target.value)} />
                  </Field>
                  <Field label="VAT number">
                    <Input value={form.vat_number ?? ""} onChange={(e) => set("vat_number", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type">
                    <Select value={form.customer_type ?? ""} onValueChange={(v) => set("customer_type", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select…" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRIVATE">Private</SelectItem>
                        <SelectItem value="COMPANY">Company</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Currency">
                    <Input value={form.currency ?? ""} onChange={(e) => set("currency", e.target.value)} />
                  </Field>
                </div>
                <div className="flex items-center gap-3">
                  <Switch checked={form.is_active ?? true} onCheckedChange={(v) => set("is_active", v)} />
                  <Label className="text-sm">Active</Label>
                </div>
              </section>

              <Separator />

              {/* ── Contact ── */}
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Contact</p>
                <Field label="Email">
                  <Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Phone">
                    <Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                  </Field>
                  <Field label="Website">
                    <Input value={form.www ?? ""} onChange={(e) => set("www", e.target.value)} />
                  </Field>
                </div>
              </section>

              <Separator />

              {/* ── Billing Address ── */}
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Billing Address</p>
                <Field label="Address">
                  <Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
                </Field>
                <Field label="Address 2">
                  <Input value={form.address2 ?? ""} onChange={(e) => set("address2", e.target.value)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Zip code">
                    <Input value={form.zip_code ?? ""} onChange={(e) => set("zip_code", e.target.value)} />
                  </Field>
                  <Field label="City">
                    <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
                  </Field>
                </div>
                <Field label="Country code">
                  <Input value={form.country_code ?? ""} onChange={(e) => set("country_code", e.target.value)} className="w-24" />
                </Field>
              </section>

              <Separator />

              {/* ── Accounting Defaults ── */}
              <section className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Defaults</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Terms of payment">
                    <Input value={form.terms_of_payment ?? ""} onChange={(e) => set("terms_of_payment", e.target.value)} />
                  </Field>
                  <Field label="Sales account">
                    <Input value={form.sales_account ?? ""} onChange={(e) => set("sales_account", e.target.value)} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Our reference">
                    <Input value={form.our_reference ?? ""} onChange={(e) => set("our_reference", e.target.value)} />
                  </Field>
                  <Field label="Your reference">
                    <Input value={form.your_reference ?? ""} onChange={(e) => set("your_reference", e.target.value)} />
                  </Field>
                </div>
              </section>

              <Separator />

              {/* ── Comments ── */}
              <Field label="Comments">
                <Textarea value={form.comments ?? ""} onChange={(e) => set("comments", e.target.value)} rows={3} />
              </Field>

              <Separator />

              {/* ── Advanced ── */}
              <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronRight className={`size-4 transition-transform ${advancedOpen ? "rotate-90" : ""}`} />
                  Advanced fields
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-5 pt-4">

                  {/* Delivery Address */}
                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Delivery Address</p>
                    <Field label="Name">
                      <Input value={form.delivery_name ?? ""} onChange={(e) => set("delivery_name", e.target.value)} />
                    </Field>
                    <Field label="Address 1">
                      <Input value={form.delivery_address1 ?? ""} onChange={(e) => set("delivery_address1", e.target.value)} />
                    </Field>
                    <Field label="Address 2">
                      <Input value={form.delivery_address2 ?? ""} onChange={(e) => set("delivery_address2", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Zip code">
                        <Input value={form.delivery_zip_code ?? ""} onChange={(e) => set("delivery_zip_code", e.target.value)} />
                      </Field>
                      <Field label="City">
                        <Input value={form.delivery_city ?? ""} onChange={(e) => set("delivery_city", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Country code">
                      <Input value={form.delivery_country_code ?? ""} onChange={(e) => set("delivery_country_code", e.target.value)} className="w-24" />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Phone 1">
                        <Input value={form.delivery_phone1 ?? ""} onChange={(e) => set("delivery_phone1", e.target.value)} />
                      </Field>
                      <Field label="Phone 2">
                        <Input value={form.delivery_phone2 ?? ""} onChange={(e) => set("delivery_phone2", e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  <Separator />

                  {/* Visiting Address */}
                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Visiting Address</p>
                    <Field label="Address">
                      <Input value={form.visiting_address ?? ""} onChange={(e) => set("visiting_address", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Zip code">
                        <Input value={form.visiting_zip_code ?? ""} onChange={(e) => set("visiting_zip_code", e.target.value)} />
                      </Field>
                      <Field label="City">
                        <Input value={form.visiting_city ?? ""} onChange={(e) => set("visiting_city", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Country code">
                      <Input value={form.visiting_country_code ?? ""} onChange={(e) => set("visiting_country_code", e.target.value)} className="w-24" />
                    </Field>
                  </section>

                  <Separator />

                  {/* Email Addresses */}
                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Email Addresses</p>
                    <Field label="Invoice email">
                      <Input value={form.email_invoice ?? ""} onChange={(e) => set("email_invoice", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Invoice CC">
                        <Input value={form.email_invoice_cc ?? ""} onChange={(e) => set("email_invoice_cc", e.target.value)} />
                      </Field>
                      <Field label="Invoice BCC">
                        <Input value={form.email_invoice_bcc ?? ""} onChange={(e) => set("email_invoice_bcc", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Offer email">
                      <Input value={form.email_offer ?? ""} onChange={(e) => set("email_offer", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Offer CC">
                        <Input value={form.email_offer_cc ?? ""} onChange={(e) => set("email_offer_cc", e.target.value)} />
                      </Field>
                      <Field label="Offer BCC">
                        <Input value={form.email_offer_bcc ?? ""} onChange={(e) => set("email_offer_bcc", e.target.value)} />
                      </Field>
                    </div>
                    <Field label="Order email">
                      <Input value={form.email_order ?? ""} onChange={(e) => set("email_order", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Order CC">
                        <Input value={form.email_order_cc ?? ""} onChange={(e) => set("email_order_cc", e.target.value)} />
                      </Field>
                      <Field label="Order BCC">
                        <Input value={form.email_order_bcc ?? ""} onChange={(e) => set("email_order_bcc", e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  <Separator />

                  {/* Invoice Defaults */}
                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Invoice Defaults</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Administration fee">
                        <Input value={form.invoice_administration_fee ?? ""} onChange={(e) => set("invoice_administration_fee", e.target.value)} />
                      </Field>
                      <Field label="Discount">
                        <Input type="number" value={form.invoice_discount ?? ""} onChange={(e) => set("invoice_discount", e.target.value ? parseFloat(e.target.value) : null)} />
                      </Field>
                    </div>
                    <Field label="Freight">
                      <Input value={form.invoice_freight ?? ""} onChange={(e) => set("invoice_freight", e.target.value)} />
                    </Field>
                    <Field label="Invoice remark">
                      <Textarea value={form.invoice_remark ?? ""} onChange={(e) => set("invoice_remark", e.target.value)} rows={2} />
                    </Field>
                    <div className="flex items-center gap-3">
                      <Switch checked={form.show_price_vat_included ?? false} onCheckedChange={(v) => set("show_price_vat_included", v)} />
                      <Label className="text-sm">Show price incl. VAT</Label>
                    </div>
                  </section>

                  <Separator />

                  {/* Delivery & Pricing */}
                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Delivery & Pricing</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Terms of delivery">
                        <Input value={form.terms_of_delivery ?? ""} onChange={(e) => set("terms_of_delivery", e.target.value)} />
                      </Field>
                      <Field label="Way of delivery">
                        <Input value={form.way_of_delivery ?? ""} onChange={(e) => set("way_of_delivery", e.target.value)} />
                      </Field>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="Price list">
                        <Input value={form.price_list ?? ""} onChange={(e) => set("price_list", e.target.value)} />
                      </Field>
                      <Field label="Cost center">
                        <Input value={form.cost_center ?? ""} onChange={(e) => set("cost_center", e.target.value)} />
                      </Field>
                      <Field label="Project">
                        <Input value={form.project ?? ""} onChange={(e) => set("project", e.target.value)} />
                      </Field>
                    </div>
                  </section>

                  <Separator />

                  {/* Identification */}
                  <section className="space-y-3">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Identification</p>
                    <Field label="VAT type">
                      <Select value={form.vat_type ?? ""} onValueChange={(v) => set("vat_type", v)}>
                        <SelectTrigger className="h-9"><SelectValue placeholder="Select…" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SEVAT">SE VAT</SelectItem>
                          <SelectItem value="SEREVERSEDVAT">SE Reversed VAT</SelectItem>
                          <SelectItem value="EUREVERSEDVAT">EU Reversed VAT</SelectItem>
                          <SelectItem value="EUVAT">EU VAT</SelectItem>
                          <SelectItem value="EXPORT">Export</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="External reference">
                      <Input value={form.external_reference ?? ""} onChange={(e) => set("external_reference", e.target.value)} />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="GLN">
                        <Input value={form.gln ?? ""} onChange={(e) => set("gln", e.target.value)} />
                      </Field>
                      <Field label="GLN (delivery)">
                        <Input value={form.gln_delivery ?? ""} onChange={(e) => set("gln_delivery", e.target.value)} />
                      </Field>
                    </div>
                    {form.fortnox_customer_number && (
                      <Field label="Fortnox customer number">
                        <p className="text-sm text-muted-foreground">{form.fortnox_customer_number}</p>
                      </Field>
                    )}
                  </section>

                </CollapsibleContent>
              </Collapsible>

            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <div className="flex h-[52px] shrink-0 items-center justify-end gap-2 border-t px-4">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={mutation.isPending || isLoading}>
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
