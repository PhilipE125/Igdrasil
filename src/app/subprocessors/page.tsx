import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { getLegalPageMetadata } from "@/lib/legal";

export const metadata = getLegalPageMetadata("subprocessors");

export default function SubprocessorsPage() {
  return <LegalDocumentPage slug="subprocessors" />;
}
