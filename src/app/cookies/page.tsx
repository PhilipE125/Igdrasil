import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { getLegalPageMetadata } from "@/lib/legal";

export const metadata = getLegalPageMetadata("cookies");

export default function CookiesPage() {
  return <LegalDocumentPage slug="cookies" />;
}
