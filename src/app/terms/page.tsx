import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { getLegalPageMetadata } from "@/lib/legal";

export const metadata = getLegalPageMetadata("terms");

export default function TermsPage() {
  return <LegalDocumentPage slug="terms" />;
}