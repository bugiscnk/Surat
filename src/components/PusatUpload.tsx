import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Download, Trash2, AlertCircle, CheckCircle2, File, Loader2 } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'word';
  uploadedAt: string;
  isTemplate?: boolean;
  contentUrl?: string;
}

export default function PusatUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load files from localStorage or set defaults
  useEffect(() => {
    const saved = localStorage.getItem('sipadig_uploaded_files');
    if (saved) {
      setFiles(JSON.parse(saved));
    } else {
      const defaultTemplates: UploadedFile[] = [
        {
          id: 'tpl-1',
          name: 'Template_Surat_Undangan_Rapat_Resmi.docx',
          size: '42.5 KB',
          type: 'word',
          uploadedAt: '2026-06-29 09:00',
          isTemplate: true
        },
        {
          id: 'tpl-2',
          name: 'Panduan_Operasional_Aplikasi_SIPADIG.pdf',
          size: '1.2 MB',
          type: 'pdf',
          uploadedAt: '2026-06-29 09:15',
          isTemplate: true
        },
        {
          id: 'tpl-3',
          name: 'Format_Nota_Dinas_Struktural.docx',
          size: '35.1 KB',
          type: 'word',
          uploadedAt: '2026-06-29 09:30',
          isTemplate: true
        }
      ];
      setFiles(defaultTemplates);
      localStorage.setItem('sipadig_uploaded_files', JSON.stringify(defaultTemplates));
    }
  }, []);

  // Save files to localStorage
  const saveFiles = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    localStorage.setItem('sipadig_uploaded_files', JSON.stringify(newFiles));
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Drop handler
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // File selection handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Process files
  const handleFiles = (fileList: FileList) => {
    setUploadError(null);
    setUploadSuccess(null);

    const allowedExtensions = ['pdf', 'doc', 'docx'];
    Array.from(fileList).forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      
      if (!allowedExtensions.includes(extension)) {
        setUploadError(`Ekstensi file .${extension} tidak didukung. Mohon upload file PDF (.pdf) atau Word (.doc, .docx).`);
        return;
      }

      // Check size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Ukuran file terlalu besar. Maksimal ukuran file adalah 5 MB.');
        return;
      }

      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const fileType: 'pdf' | 'word' = extension === 'pdf' ? 'pdf' : 'word';
      const formattedSize = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(1)} KB`;

      // Start simulated upload progress
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Generate an interactive download link (blob URL)
          const fileBlob = new Blob([`Dummy content for uploaded file ${file.name}`], { type: file.type });
          const contentUrl = URL.createObjectURL(fileBlob);

          const newUploadedFile: UploadedFile = {
            id: fileId,
            name: file.name,
            size: formattedSize,
            type: fileType,
            uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            contentUrl
          };

          setFiles(prev => {
            const updated = [newUploadedFile, ...prev];
            localStorage.setItem('sipadig_uploaded_files', JSON.stringify(updated));
            return updated;
          });

          setUploadSuccess(`Berkas "${file.name}" berhasil diunggah.`);
          
          // Clear progress indicator after 1s
          setTimeout(() => {
            setUploadProgress(prev => {
              const copy = { ...prev };
              delete copy[fileId];
              return copy;
            });
          }, 1000);
        }
      }, 250);
    });
  };

  // Trigger file selection click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Delete file handler
  const handleDeleteFile = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus berkas "${name}" dari sistem?`)) {
      const updated = files.filter(f => f.id !== id);
      saveFiles(updated);
      setUploadSuccess(`Berkas "${name}" berhasil dihapus.`);
    }
  };

  // Trigger download of mock template with appropriate file header/blob type
  const handleDownloadTemplate = (file: UploadedFile) => {
    let blob: Blob;
    let fileName = file.name;

    if (file.type === 'pdf') {
      // Mock PDF structure
      const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Title (${file.name}) /Creator (SIPADIG Document Engine) >>\nendobj\nxref\n0 1\n0000000000 65535 f\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
      blob = new Blob([pdfContent], { type: 'application/pdf' });
    } else {
      // Mock Word (HTML format that MS Word can open natively)
      const docContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\n<head><title>${file.name}</title></head>\n<body>\n<h2>SIPADIG — SISTEM PERSURATAN DIGITAL</h2>\n<p><b>Nama Dokumen:</b> ${file.name}</p>\n<p><b>Tanggal Download:</b> ${new Date().toLocaleDateString('id-ID')}</p>\n<p>Ini adalah file contoh ekstensi Word (.docx) yang diunduh langsung dari Pusat Upload Berkas SIPADIG.</p>\n</body>\n</html>`;
      blob = new Blob([docContent], { type: 'application/msword' });
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Informational header info alert */}
      <div className="bg-emerald-50 border border-emerald-150 rounded-2xl p-4.5 flex gap-3 text-emerald-800 text-xs">
        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="font-bold font-sans">Pusat Manajemen Berkas Pendukung (PDF & Word)</h5>
          <p className="leading-relaxed font-medium">
            Di sini Anda dapat mengunggah file pendukung persuratan dengan ekstensi <b>PDF (.pdf)</b> dan <b>Word (.doc, .docx)</b>. Sistem juga menyediakan draf template surat dinas resmi yang siap pakai untuk diunduh.
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left column: Drag and Drop Upload Area */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-4">Unggah Berkas Baru</span>
            
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 min-h-[220px] ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800' 
                  : 'border-slate-200 hover:border-emerald-500/50 bg-slate-50 hover:bg-white text-slate-500'
              }`}
            >
              <input 
                id="file-upload-input"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-emerald-600">
                <UploadCloud className="h-6 w-6 animate-bounce" />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800">Tarik berkas Anda di sini</p>
                <p className="text-[10px] text-slate-400">atau <span className="text-emerald-600 font-bold underline">pilih dari komputer</span></p>
              </div>

              <div className="pt-2 text-[9px] text-slate-400 font-medium">
                Mendukung ekstensi: <b className="text-slate-600">PDF, DOC, DOCX</b> (Maksimal 5MB)
              </div>
            </div>
          </div>

          {/* Feedback Area */}
          <div className="mt-4 space-y-2.5">
            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-700 text-[11px] font-bold flex gap-2 items-start leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}
            {uploadSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-700 text-[11px] font-bold flex gap-2 items-start leading-relaxed animate-pulse">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: List of uploaded files and templates */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Daftar Berkas & Template Tersedia</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[9px] font-mono font-bold border border-emerald-150">
              Total: {files.length} Berkas
            </span>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto max-h-[350px] space-y-2.5 divide-y divide-slate-50">
            {files.map((file) => {
              const isUploading = uploadProgress[file.id] !== undefined && uploadProgress[file.id] < 100;
              return (
                <div key={file.id} className="flex items-center justify-between gap-3 pt-2.5 first:pt-0">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    
                    {/* Icon based on filetype */}
                    <div className={`p-2.5 rounded-xl shrink-0 border ${
                      file.type === 'pdf' 
                        ? 'bg-rose-50 text-rose-600 border-rose-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-800 truncate leading-snug">{file.name}</p>
                        {file.isTemplate && (
                          <span className="bg-amber-50 text-amber-700 text-[8px] font-bold uppercase tracking-wide border border-amber-250 px-1.5 rounded leading-none py-0.5">
                            TEMPLATE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400 font-mono">
                        <span>{file.size}</span>
                        <span>•</span>
                        <span>Diunggah: {file.uploadedAt}</span>
                      </div>
                      
                      {/* Upload Progress Bar if active */}
                      {isUploading && (
                        <div className="mt-2 w-full max-w-xs space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-200"
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-emerald-600 font-mono font-bold flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Mengunggah: {uploadProgress[file.id]}%</span>
                          </p>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id={`btn-download-file-${file.id}`}
                      onClick={() => handleDownloadTemplate(file)}
                      className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-100"
                      title="Unduh Berkas"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    {!file.isTemplate && (
                      <button
                        id={`btn-delete-file-${file.id}`}
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Hapus Berkas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {files.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                Belum ada berkas pendukung yang diunggah.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
