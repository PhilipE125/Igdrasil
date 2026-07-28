import { lazy, Suspense } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AccountingAutomationTabs } from "@/components/views/AccountingAutomationTabs";

const ReviewDetailView = lazy(() =>
  import("@/components/views/ReviewDetailView").then((m) => ({ default: m.ReviewDetailView })),
);

const AccountingAutomationReview = () => {
  return (
    <MainLayout>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <AccountingAutomationTabs activeTab="review" />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border">
          <Suspense fallback={null}>
            <ReviewDetailView />
          </Suspense>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountingAutomationReview;
