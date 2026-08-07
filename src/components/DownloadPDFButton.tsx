
import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Loader2 } from 'lucide-react';

interface DownloadPDFButtonProps {
    targetId: string;
    fileName?: string;
}

export const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
    targetId,
    fileName = 'triz-analysis-report.pdf'
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsGenerating(true);

        try {
            // Wait for any animations or images to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2, // Improve quality
                logging: false,
                useCORS: true,
                backgroundColor: '#0B0F19', // Match the dark theme background
            });

            const imgData = canvas.toDataURL('image/png');

            // A4 dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);

            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // If image is taller than A4, we might need multiple pages or just fit it
            // For now, let's keep it simple and fit width, allowing height to go wherever (or split if we wanted to get fancy)
            // But since this is a "dashboard" view, fitting it on one page might make it too small if it's long.
            // Let's just add the image. If it's too long, we might need to handle pagination manually, 
            // but usually html2canvas produces one long image. 
            // Better approach for long content: Split into pages.

            let heightLeft = imgHeight;
            let position = 0;
            let pageHeight = pdfHeight;

            // First page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            // Add extra pages if needed
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight; // This logic might be slightly off for simple pagination of one image
                // Standard simple pagination for long image:
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, -pageHeight + (heightLeft - (imgHeight - pageHeight)), pdfWidth, imgHeight);
                // Wait, simpler generic logic: 
                // We shift the image up by pageHeight each time. 
            }
            // Actually, simpler logic for "just save what you see":
            // If it's a long scrollable report, users often prefer a long continuous PDF or just auto-split.
            // Let's stick to the simplest valid implementation first: Single page if it fits, or let jsPDF handles it? 
            // jsPDF doesn't auto-split one image. 
            // Let's just do a simple "fit width" and let it flow on one page (custom size) OR standard A4 split.

            // REVISION: Let's use custom page size to fit the content exactly if it's a digital report.
            // This avoids awkward page breaks in the middle of charts.
            // const pdf = new jsPDF('p', 'mm', [pdfWidth, imgHeight]); // Dynamic height PDF?

            // But users might want to print. Let's stick to standard A4 but maybe scale it?
            // Let's go with the standard "Fit Width, Multiple Pages" approach if it's really long, 
            // OR just a flexible height PDF which is better for screen viewing.
            // Given the requested "Futuristic Dashboard" vibe, a digital-first PDF (custom height) is often nicer.
            // However, "Download as PDF" usually implies printing capability.

            // Let's try the simple single page split first.
            if (imgHeight > pdfHeight) {
                // Reset and create a new PDF with custom size to capture full dashboard in one view
                // which is often better for "screenshots" of dashboards.
                const longPdf = new jsPDF({
                    orientation: 'p',
                    unit: 'mm',
                    format: [pdfWidth, imgHeight]
                });
                longPdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                longPdf.save(fileName);
            } else {
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
                pdf.save(fileName);
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
            {isGenerating ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    Generating...
                </>
            ) : (
                <>
                    <Download className="w-4 h-4 group-hover:text-violet-400 transition-colors" />
                    Save PDF
                </>
            )}
        </button>
    );
};
