import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, EmployeeCreate, BankInfo } from "@/lib/employeeApi";
import { listBanks } from "@/lib/employeeApi";
import { authenticatedApiRequest } from "@/lib/uploadApi";

const CARD_BRANDS = ["Mastercard", "Visa"] as const;
type CardBrand = typeof CARD_BRANDS[number];

const schema = z.object({
  first_name: z.string().min(1, "Förnamn krävs"),
  last_name: z.string().min(1, "Efternamn krävs"),
  role: z.string().optional(),
  personnummer: z
    .string()
    .regex(/^\d{8}-\d{4}$/, "Format: YYYYMMDD-XXXX")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Ogiltig e-post").optional().or(z.literal("")),
  bank_name: z.string().optional(),
  clearing_number: z.string().optional(),
  account_number: z.string().optional(),
  card_last_four: z
    .string()
    .regex(/^\d{0,4}$/, "Endast siffror (max 4)")
    .optional()
    .or(z.literal("")),
  card_brand: z.enum(["Mastercard", "Visa", ""]).optional(),
  salary_type: z.enum(["hourly", "monthly"]).optional(),
  hourly_rate: z.coerce.number().positive().optional(),
  gross_salary: z.coerce.number().positive().optional(),
  tax_rate: z.coerce.number().min(0).max(100).default(30),
});

type FormValues = z.infer<typeof schema>;

interface CardRule {
  id: string;
  card_last_four: string;
  card_brand: string | null;
  person_name: string | null;
}

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: EmployeeCreate) => Promise<void>;
  employee?: Employee | null;
  cardRules?: CardRule[];
}

export function EmployeeForm({
  open,
  onOpenChange,
  onSubmit,
  employee,
  cardRules = [],
}: EmployeeFormProps) {
  const [banks, setBanks] = useState<BankInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      tax_rate: 30,
    },
  });

  const salaryType = watch("salary_type");
  const bankName = watch("bank_name");

  useEffect(() => {
    listBanks().then(setBanks).catch(() => {});
  }, []);

  useEffect(() => {
    if (employee) {
      const linkedCard = cardRules.find((cr) => cr.id === employee.card_rule_id);
      reset({
        first_name: employee.first_name,
        last_name: employee.last_name,
        role: employee.role || "",
        personnummer: employee.personnummer || "",
        email: employee.email || "",
        bank_name: employee.bank_name || "",
        clearing_number: employee.clearing_number || "",
        account_number: employee.account_number || "",
        card_last_four: linkedCard?.card_last_four || employee.card_last_four || "",
        card_brand: (linkedCard?.card_brand as CardBrand | undefined) || undefined,
        salary_type: employee.salary_type || undefined,
        hourly_rate: employee.hourly_rate || undefined,
        gross_salary: employee.gross_salary || undefined,
        tax_rate: employee.tax_rate,
      });
    } else {
      reset({ tax_rate: 30 });
    }
  }, [employee, cardRules, reset]);

  // Auto-fill clearing number when bank changes
  useEffect(() => {
    if (bankName) {
      const bank = banks.find(
        (b) => b.name.toLowerCase() === bankName.toLowerCase(),
      );
      if (bank && bank.clearing_ranges.length > 0) {
        const prefix = bank.clearing_ranges[0].split("-")[0];
        setValue("clearing_number", prefix);
      }
    }
  }, [bankName, banks, setValue]);

  async function onFormSubmit(values: FormValues) {
    setLoading(true);
    try {
      // Resolve card_rule_id from entered card details
      let card_rule_id: string | undefined;
      const lastFour = values.card_last_four?.trim();
      if (lastFour && lastFour.length === 4) {
        const existing = cardRules.find((cr) => cr.card_last_four === lastFour);
        if (existing) {
          card_rule_id = existing.id;
        } else {
          const newRule = await authenticatedApiRequest<CardRule>("/card-rules", {
            method: "POST",
            body: JSON.stringify({
              card_last_four: lastFour,
              card_brand: values.card_brand || null,
              person_name: `${values.first_name} ${values.last_name}`,
              credit_account: 1930,
            }),
          });
          card_rule_id = newRule.id;
        }
      }

      const data: EmployeeCreate = {
        first_name: values.first_name,
        last_name: values.last_name,
        role: values.role || undefined,
        personnummer: values.personnummer || undefined,
        email: values.email || undefined,
        bank_name: values.bank_name || undefined,
        clearing_number: values.clearing_number || undefined,
        account_number: values.account_number || undefined,
        card_rule_id,
        salary_type: values.salary_type,
        hourly_rate: values.salary_type === "hourly" ? values.hourly_rate : undefined,
        gross_salary: values.salary_type === "monthly" ? values.gross_salary : undefined,
        tax_rate: values.tax_rate,
      };
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Redigera anställd" : "Lägg till anställd"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="first_name">Förnamn *</Label>
              <Input id="first_name" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="last_name">Efternamn *</Label>
              <Input id="last_name" {...register("last_name")} />
              {errors.last_name && (
                <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div>
            <Label htmlFor="role">Roll</Label>
            <Input id="role" placeholder="T.ex. Utvecklare" {...register("role")} />
          </div>

          {/* Personnummer */}
          <div>
            <Label htmlFor="personnummer">Personnummer</Label>
            <Input id="personnummer" placeholder="YYYYMMDD-XXXX" {...register("personnummer")} />
            {errors.personnummer && (
              <p className="text-xs text-red-500 mt-1">{errors.personnummer.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">E-post</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Bank */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Bank</Label>
              <Select
                value={bankName || ""}
                onValueChange={(v) => setValue("bank_name", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((b) => (
                    <SelectItem key={b.name} value={b.name}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="clearing_number">Clearing</Label>
              <Input id="clearing_number" {...register("clearing_number")} />
            </div>
            <div>
              <Label htmlFor="account_number">Kontonummer</Label>
              <Input id="account_number" {...register("account_number")} />
            </div>
          </div>

          {/* Card details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="card_last_four">Kortets 4 sista siffror</Label>
              <Input
                id="card_last_four"
                placeholder="1234"
                maxLength={4}
                inputMode="numeric"
                {...register("card_last_four")}
              />
              {errors.card_last_four && (
                <p className="mt-1 text-xs text-red-500">{errors.card_last_four.message}</p>
              )}
            </div>
            <div>
              <Label>Kortnätverk</Label>
              <Select
                value={watch("card_brand") || ""}
                onValueChange={(v) => setValue("card_brand", v as CardBrand | "")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj nätverk" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_BRANDS.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary type */}
          <div>
            <Label>Lönetyp</Label>
            <Select
              value={salaryType || ""}
              onValueChange={(v) =>
                setValue("salary_type", v as "hourly" | "monthly")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Välj senare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Timlön</SelectItem>
                <SelectItem value="monthly">Månadslön</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {salaryType === "hourly" && (
            <div>
              <Label htmlFor="hourly_rate">Timlön (SEK)</Label>
              <Input
                id="hourly_rate"
                type="number"
                step="0.01"
                {...register("hourly_rate")}
              />
            </div>
          )}

          {salaryType === "monthly" && (
            <div>
              <Label htmlFor="gross_salary">Bruttolön (SEK)</Label>
              <Input
                id="gross_salary"
                type="number"
                step="0.01"
                {...register("gross_salary")}
              />
            </div>
          )}

          {/* Tax rate */}
          <div>
            <Label htmlFor="tax_rate">Skattesats (%)</Label>
            <Input
              id="tax_rate"
              type="number"
              step="0.1"
              {...register("tax_rate")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sparar..." : employee ? "Spara" : "Lägg till"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
