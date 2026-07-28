import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { getLegalPageMetadata } from "@/lib/legal";

export const metadata = getLegalPageMetadata("privacy");

export default function PrivacyPage() {
  return <LegalDocumentPage slug="privacy" />;
}