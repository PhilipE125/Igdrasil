import { User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Employee } from "@/lib/employeeApi";

interface EmployeeCardProps {
  employee: Employee;
  onClick: () => void;
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md border border-gray-200"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <User className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-sm">
            {employee.first_name} {employee.last_name}
          </p>
          {employee.role && (
            <p className="truncate text-xs text-muted-foreground">{employee.role}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
