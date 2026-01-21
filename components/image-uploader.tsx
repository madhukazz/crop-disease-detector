"use client";
import { useState, useRef } from "react";
import { Upload, Search, Leaf, AlertCircle, CheckCircle2, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ImageUploader() {
    const [image, setImage] = useState<string | null>(null);
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
            setResult(""); // කලින් තිබුණු result එක clear කරන්න
        }
    };

    //pdf download 
    const downloadPDF = async () => {
        const element = document.getElementById("analysis-report");
        if (!element) return;

        const canvas = await html2canvas(element, {
            scale: 2, // Quality එක වැඩි කිරීමට
            useCORS: true
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
        pdf.save("Crop_Analysis_Report.pdf");
    };

    const analyzeImage = async () => {
        if (!image) return;
        setLoading(true);
        try {
            const res = await fetch("/api/analyze-crop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image }),
            });
            const data = await res.json();
            setResult(data.analysis);
        } catch (error) {
            setResult("දෝෂයක් සිදුවිය. කරුණාකර නැවත උත්සාහ කරන්න.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-block p-3 bg-green-100 rounded-full mb-4"
                    >
                        <Leaf className="w-8 h-8 text-green-600" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">බෝග වල රෝග හඳුනාගැනීමේ සහායක</h1>
                    <p className="text-slate-600">පින්තූරයක් ලබා දී ඔබගේ වගාවේ රෝග සහ පිළියම් ක්ෂණිකව ලබා ගන්න.</p>
                </div>

                {/* Upload Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                    <div className="p-8">
                        {!image ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 rounded-xl p-12 text-center hover:border-green-400 hover:bg-green-50/30 transition-all cursor-pointer group"
                            >
                                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4 group-hover:text-green-500 transition-colors" />
                                <p className="text-slate-600 font-medium">පින්තූරයක් තෝරන්න හෝ මෙතනට අදින්න</p>
                                <p className="text-slate-400 text-sm mt-1">PNG, JPG (Max 5MB)</p>
                                <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" accept="image/*" />
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="relative group rounded-xl overflow-hidden shadow-md">
                                    <img src={image} alt="Selected crop" className="w-full max-h-[400px] object-cover" />
                                    <button
                                        onClick={() => { setImage(null); setResult(""); }}
                                        className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                    >
                                        <RefreshCcw className="w-5 h-5" />
                                    </button>
                                </div>

                                {!result && (
                                    <button
                                        onClick={analyzeImage}
                                        disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-semibold py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                පරීක්ෂා කරමින් පවතී...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-5 h-5" />
                                                රෝගය පරීක්ෂා කරන්න
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Result Section */}
                    <AnimatePresence>
                        {result && (
                            <div className="mt-8 space-y-4">
                                <div id="analysis-report" className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                    <h2 className="text-xl font-bold mb-4 text-green-800 border-b pb-2">විශ්ලේශන වාර්තාව</h2>
                                    <div className="prose prose-slate max-w-none">
                                        <ReactMarkdown>{result}</ReactMarkdown>
                                    </div>
                                    <p className="mt-6 text-xs text-slate-400">විශ්ලේශන වාර්තාව ජනනය කළ දිනය: {new Date().toLocaleDateString()}</p>
                                </div>

                                <button
                                    onClick={downloadPDF}
                                    className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl hover:bg-slate-900 transition-all w-full justify-center"
                                >
                                    වාර්තාව PDF ලෙස බාගත කරගන්න (Download PDF)
                                </button>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tip Section */}
                <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 rounded-xl text-blue-800 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p>හොඳම ප්‍රතිඵල ලබා ගැනීම සඳහා පත්‍රයේ පින්තූරය පැහැදිලිව සහ ප්‍රමාණවත් ආලෝකයක් සහිතව ලබා ගන්න.</p>
                </div>
            </div>
        </div>
    );
}