import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Database,
  CheckCircle2,
} from "lucide-react";

interface BackupSectionProps {
  backupSuccess: string | null;
  lastBackupDate: Date | null;
  isExporting: boolean;
  isImporting: boolean;
  isClearing: boolean;
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearAll: () => void;
}

export function BackupSection({
  backupSuccess,
  lastBackupDate,
  isExporting,
  isImporting,
  isClearing,
  onExport,
  onImport,
  onClearAll,
}: BackupSectionProps) {
  return (
    <div className="space-y-6">
      {/* Success Message */}
      {backupSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-green-800 dark:text-green-200">{backupSuccess}</p>
        </div>
      )}

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download all your health data as a JSON file for backup or transfer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>What&apos;s included:</strong> Pain logs, exercise
              sessions, diet entries, medications, meal plans, and all personal
              settings.
            </p>
          </div>

          {lastBackupDate && (
            <p className="text-sm text-muted-foreground">
              Last backup: {lastBackupDate.toLocaleString()}
            </p>
          )}

          <Button
            onClick={onExport}
            disabled={isExporting}
            className="w-full gap-2"
            size="lg"
          >
            <Download className="h-5 w-5" />
            {isExporting ? "Exporting..." : "Export All Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>
            Restore your data from a previously exported backup file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Warning: This will merge imported data with existing data
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  If you want to replace all data, clear existing data first.
                  The page will reload after import.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-file">Select Backup File</Label>
            <Input
              id="import-file"
              type="file"
              accept=".json"
              onChange={onImport}
              disabled={isImporting}
              className="cursor-pointer"
            />
          </div>

          {isImporting && (
            <p className="text-sm text-muted-foreground">
              Importing data... Please wait.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Clear All Data */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete all your data from this device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  This action cannot be undone!
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  All pain logs, exercise sessions, diet entries, medications,
                  and settings will be permanently deleted from IndexedDB
                  storage.
                </p>
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mt-2">
                  💡 Tip: Export your data first if you might need it later.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={onClearAll}
            disabled={isClearing}
            className="w-full gap-2 bg-red-600 hover:bg-red-700 text-white"
            size="lg"
          >
            <Trash2 className="h-5 w-5" />
            {isClearing ? "Clearing Data..." : "Clear All Data"}
          </Button>
        </CardContent>
      </Card>

      {/* Storage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Storage Information
          </CardTitle>
          <CardDescription>
            Your data is stored locally using IndexedDB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              • All data stays on your device - nothing is sent to servers
            </p>
            <p className="text-muted-foreground">
              • Regular backups are recommended for data safety
            </p>
            <p className="text-muted-foreground">
              • Clearing browser data will remove all app data
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
