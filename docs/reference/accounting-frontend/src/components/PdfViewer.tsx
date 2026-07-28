import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface PdfViewerProps {
  file?: File;
  sourceUrl?: string;
  className?: string;
}

export const PdfViewer = ({ file, sourceUrl, className = "" }: PdfViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load PDF document
  useEffect(() => {
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let arrayBuffer: ArrayBuffer;
        if (file && file.size > 0) {
          arrayBuffer = await file.arrayBuffer();
        } else if (sourceUrl) {
          const response = await fetch(sourceUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.status}`);
          }
          arrayBuffer = await response.arrayBuffer();
        } else {
          throw new Error("No PDF source provided");
        }

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF");
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [file, sourceUrl]);

  // Render current page
  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage, scale]);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  if (isLoading) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading PDF…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-full items-center justify-center ${className}`}>
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="h-8 w-8"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="h-8 w-8"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[50px] text-center text-xs text-muted-foreground">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={scale >= 3}
            className="h-8 w-8"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-muted/30 p-4"
      >
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="shadow-lg"
            style={{ maxWidth: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};
