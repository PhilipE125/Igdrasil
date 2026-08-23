import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { getLegalPageMetadata } from "@/lib/legal";

export const metadata = getLegalPageMetadata("security-overview");

export default function SecurityOverviewPage() {
  return <LegalDocumentPage slug="security-overview" />;
}
