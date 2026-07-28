import invoiceSquirrel from "@/assets/igdrasil-characters/invoice_squirrel.png";

/**
 * Invoice squirrel mascot with a gentle bounce loop.
 */
export function PixelSquirrelLoader({ className = "" }: { className?: string }) {

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={invoiceSquirrel}
        alt="Processing…"
        className="h-10 w-10 object-contain animate-bounce"
      />
    </div>
  );
}
