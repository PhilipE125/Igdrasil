import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { getLegalPageMetadata } from "@/lib/legal";

export const metadata = getLegalPageMetadata("dpa");

export default function DpaPage() {
  return <LegalDocumentPage slug="dpa" />;
}
