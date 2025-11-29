"use client";

import { useState, useCallback } from "react";
import { PageContainer, PageContent, PageHeaderWithTitle } from "@/components/ui/layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson, AlertCircle, CheckCircle2 } from "lucide-react";
import { VStack, HStack, Muted } from "@/components/lib";
import { cn } from "@/lib/utils";
import { backupApi } from "@/lib/api/backup";

export default function SettingsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle");
  const [importMessage, setImportMessage] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === "application/json" || file.name.endsWith(".json"));

    if (jsonFile) {
      handleFileImport(jsonFile);
    } else {
      setImportStatus("error");
      setImportMessage("Please drop a valid JSON file");
      setTimeout(() => setImportStatus("idle"), 3000);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
  }, []);

  const handleFileImport = async (file: File) => {
    setIsImporting(true);
    setImportStatus("idle");

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      const result = await backupApi.importData(data);

      const total = result.categoriesImported + result.accountsImported +
                    result.transactionsImported + result.rulesImported;

      setImportStatus("success");
      setImportMessage(
        `Successfully imported ${total} items: ${result.categoriesImported} categories, ` +
        `${result.accountsImported} accounts, ${result.transactionsImported} transactions, ` +
        `${result.rulesImported} rules`
      );
      setTimeout(() => setImportStatus("idle"), 8000);
    } catch (error) {
      setImportStatus("error");
      setImportMessage(error instanceof Error ? error.message : "Failed to import data");
      setTimeout(() => setImportStatus("idle"), 5000);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const data = await backupApi.exportData();

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `arian-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageContainer>
      <PageContent>
        <PageHeaderWithTitle
          title="settings"
          subtitle="Manage your account and data preferences"
        />

        <VStack spacing="lg" className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Export Data</CardTitle>
              <CardDescription>
                Download all your data as a JSON file. This includes transactions, accounts, categories, and rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                {isExporting ? "Exporting..." : "Export Data"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Import Data</CardTitle>
              <CardDescription>
                Import your data from a JSON file. This will merge with your existing data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VStack spacing="md">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
                    isDragging && "border-primary bg-primary/5",
                    !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50"
                  )}
                >
                  <VStack spacing="md" align="center">
                    <div className={cn(
                      "rounded-full p-4 transition-colors",
                      isDragging ? "bg-primary/10" : "bg-muted"
                    )}>
                      <FileJson className={cn(
                        "h-8 w-8 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>

                    <VStack spacing="xs" align="center">
                      <p className="text-sm font-medium">
                        {isDragging ? "Drop your file here" : "Drag and drop your JSON file"}
                      </p>
                      <Muted size="xs">
                        or click below to browse
                      </Muted>
                    </VStack>

                    <label htmlFor="file-upload">
                      <input
                        id="file-upload"
                        type="file"
                        accept=".json,application/json"
                        onChange={handleFileSelect}
                        className="sr-only"
                        disabled={isImporting}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isImporting}
                        onClick={() => document.getElementById("file-upload")?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        {isImporting ? "Importing..." : "Select File"}
                      </Button>
                    </label>
                  </VStack>
                </div>

                {importStatus !== "idle" && (
                  <HStack spacing="sm" align="start" className={cn(
                    "p-4 rounded-lg border",
                    importStatus === "success" && "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                    importStatus === "error" && "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                  )}>
                    {importStatus === "success" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <VStack spacing="xs" className="flex-1">
                      <p className={cn(
                        "text-sm font-medium",
                        importStatus === "success" && "text-green-900 dark:text-green-100",
                        importStatus === "error" && "text-red-900 dark:text-red-100"
                      )}>
                        {importStatus === "success" ? "Success" : "Error"}
                      </p>
                      <p className={cn(
                        "text-sm",
                        importStatus === "success" && "text-green-700 dark:text-green-300",
                        importStatus === "error" && "text-red-700 dark:text-red-300"
                      )}>
                        {importMessage}
                      </p>
                    </VStack>
                  </HStack>
                )}
              </VStack>
            </CardContent>
          </Card>
        </VStack>
      </PageContent>
    </PageContainer>
  );
}
