"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, FileText, Image as ImageIcon, ExternalLink, Plus, ChevronDown } from "lucide-react";
import { getSignedFileUrl, type LeadFileRow } from "@/app/actions/lead-files";
import { uploadLeadFileStaff } from "@/lib/upload-lead-file";
import { FILE_TYPE_OPTIONS, type LeadFileType } from "@/lib/supabase/storage";

const FILE_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  FILE_TYPE_OPTIONS.map((o) => [o.value, o.label])
);

function FileTypeDropdown({
  value,
  onChange,
}: {
  value: LeadFileType;
  onChange: (value: LeadFileType) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-auto items-center gap-1.5 rounded-[7px] border border-line bg-[#fcfdff] px-2.5 text-[12px] text-charcoal outline-none transition focus:border-blue"
      >
        {FILE_TYPE_LABEL[value]}
        <ChevronDown className="h-3.5 w-3.5 text-charcoal-soft" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-20 mt-1 w-40 overflow-hidden rounded-[9px] border border-line bg-card shadow-[var(--shadow-lg)]">
          {FILE_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-[13px] transition hover:bg-paper-2 ${
                opt.value === value ? "font-semibold text-blue" : "text-charcoal"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AttachmentsPanel({
  leadId,
  files,
  onFilesChanged,
}: {
  leadId: string;
  files: LeadFileRow[];
  onFilesChanged: () => void;
}) {
  const [uploadType, setUploadType] = useState<LeadFileType>("photo");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const result = await uploadLeadFileStaff(leadId, file, uploadType);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onFilesChanged();
  }

  async function handleView(f: LeadFileRow) {
    // Open the tab synchronously, in direct response to the click, then point
    // it at the signed URL once fetched — opening only after the `await`
    // below would get silently popup-blocked by the browser. Can't pass
    // "noopener" here since that makes window.open return null, and we need
    // the handle to redirect it once the signed URL is ready.
    const tab = window.open("", "_blank");
    setViewingId(f.id);
    const url = await getSignedFileUrl(f.file_path);
    setViewingId(null);
    if (url && tab) {
      tab.location.href = url;
    } else {
      tab?.close();
      setError("Could not open that file.");
    }
  }

  return (
    <div className="space-y-3">
      {files.length === 0 ? (
        <p className="text-xs text-charcoal-soft italic">No files attached yet.</p>
      ) : (
        <div className="space-y-1.5">
          {files.map((f) => {
            const isImage = f.file_type === "photo";
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => handleView(f)}
                disabled={viewingId === f.id}
                className="flex w-full items-center gap-2.5 rounded-[9px] border border-line-soft bg-paper-2 px-3 py-2 text-left text-xs transition hover:border-blue/40 hover:bg-blue-light disabled:opacity-60"
              >
                {isImage ? (
                  <ImageIcon className="h-4 w-4 shrink-0 text-blue" />
                ) : (
                  <FileText className="h-4 w-4 shrink-0 text-blue" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-charcoal">
                    {FILE_TYPE_LABEL[f.file_type] ?? f.file_type}
                  </span>
                  <span className="text-[10px] text-charcoal-soft">
                    {formatDate(f.created_at)}
                  </span>
                </span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0 text-charcoal-soft" />
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="text-xs text-clay">{error}</p>}

      <div className="flex items-center gap-2">
        <FileTypeDropdown value={uploadType} onChange={setUploadType} />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          onChange={(e) => handleFileSelected(e.target.files)}
          className="hidden"
          id={`attach-input-${leadId}`}
        />
        <label
          htmlFor={`attach-input-${leadId}`}
          className={`inline-flex cursor-pointer items-center gap-1.5 rounded-[9px] border border-dashed border-line px-2.5 py-1.5 text-[11px] font-medium text-charcoal-soft transition hover:border-blue hover:text-blue ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          {uploading ? <Paperclip className="h-3.5 w-3.5 animate-pulse" /> : <Plus className="h-3.5 w-3.5" />}
          {uploading ? "Uploading..." : "Add file"}
        </label>
      </div>
    </div>
  );
}
