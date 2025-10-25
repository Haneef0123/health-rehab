"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserStore } from "@/stores";
import { FileText, Upload, Trash2, Download, File } from "lucide-react";
import type { UserDocument } from "@/types/user";

const DOCUMENT_TYPE_LABELS = {
  report: "Medical Report",
  medication: "Medication Info",
  imaging: "Imaging/Scans",
  prescription: "Prescription",
  insurance: "Insurance",
  other: "Other",
};

const DOCUMENT_TYPE_COLORS = {
  report: "bg-blue-100 text-blue-800",
  medication: "bg-green-100 text-green-800",
  imaging: "bg-purple-100 text-purple-800",
  prescription: "bg-orange-100 text-orange-800",
  insurance: "bg-pink-100 text-pink-800",
  other: "bg-gray-100 text-gray-800",
};

export function DocumentsSection() {
  const { user, addDocument, deleteDocument } = useUserStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState<{
    type: UserDocument["type"];
    title: string;
    fileName: string;
    notes: string;
  }>({
    type: "report",
    title: "",
    fileName: "",
    notes: "",
  });

  const documents = user?.documents || [];

  const handleAddDocument = async () => {
    if (!newDoc.title || !newDoc.fileName) {
      alert("Please fill in document title and file name");
      return;
    }

    await addDocument({
      type: newDoc.type,
      title: newDoc.title,
      fileName: newDoc.fileName,
      notes: newDoc.notes || undefined,
    });

    // Reset form
    setNewDoc({
      type: "report",
      title: "",
      fileName: "",
      notes: "",
    });
    setIsAdding(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewDoc((prev) => ({
        ...prev,
        fileName: file.name,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""), // Use filename as title if empty
      }));
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Medical Documents
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Store reports, prescriptions, and other medical documents
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          variant={isAdding ? "outline" : "default"}
        >
          {isAdding ? "Cancel" : "Add Document"}
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Document Form */}
        {isAdding && (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg space-y-4 bg-gray-50">
            <div>
              <Label htmlFor="doc-type">Document Type</Label>
              <select
                id="doc-type"
                className="mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-sm"
                value={newDoc.type}
                onChange={(e) =>
                  setNewDoc({
                    ...newDoc,
                    type: e.target.value as UserDocument["type"],
                  })
                }
              >
                {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="doc-title">Document Title</Label>
              <Input
                id="doc-title"
                placeholder="e.g., MRI Results - Jan 2025"
                value={newDoc.title}
                onChange={(e) =>
                  setNewDoc({ ...newDoc, title: e.target.value })
                }
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="doc-file">File</Label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  id="doc-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              {newDoc.fileName && (
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {newDoc.fileName}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="doc-notes">Notes (Optional)</Label>
              <textarea
                id="doc-notes"
                rows={2}
                placeholder="Add any relevant notes..."
                value={newDoc.notes}
                onChange={(e) =>
                  setNewDoc({ ...newDoc, notes: e.target.value })
                }
                className="mt-1 w-full rounded-lg border-2 border-gray-200 px-4 py-2 text-sm"
              />
            </div>

            <Button onClick={handleAddDocument} className="w-full">
              Save Document
            </Button>
          </div>
        )}

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No documents uploaded yet</p>
            <p className="text-sm">Click "Add Document" to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <File className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {doc.title}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {doc.fileName}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        DOCUMENT_TYPE_COLORS[doc.type]
                      }`}
                    >
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Uploaded: {formatDate(doc.uploadedAt)}</span>
                    {doc.fileSize && (
                      <span>{formatFileSize(doc.fileSize)}</span>
                    )}
                  </div>

                  {doc.notes && (
                    <p className="text-sm text-gray-600 mt-2 italic">
                      {doc.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      // In a real app, this would trigger a download
                      alert(`Download: ${doc.fileName}`);
                    }}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete "${doc.title}"?`)) {
                        deleteDocument(doc.id);
                      }
                    }}
                    title="Delete"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
