"use client"
import { useState } from "react"
import { db, app } from "@/firebase/firebaseconfig"
import { collection, getDocs, query, where, updateDoc, doc, deleteField, writeBatch, getFirestore } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertTriangle, Trash2, Database, Search } from "lucide-react"

export default function MigrationPage() {
    const [loading, setLoading] = useState(false)
    const [logs, setLogs] = useState([])
    const [scannedCount, setScannedCount] = useState(0)
    const [cleanedCount, setCleanedCount] = useState(0)

    // Analysis State
    const [analysisStats, setAnalysisStats] = useState(null)
    const [analyzing, setAnalyzing] = useState(false)

    const addLog = (message, type = "info") => {
        setLogs((prev) => [...prev, { message, type, id: Date.now() + Math.random() }])
    }

    const analyzeDefaultDB = async () => {
        setAnalyzing(true)
        setAnalysisStats(null)
        addLog("Starting Deep Analysis on (default) database...", "info")

        try {
            const response = await fetch("/api/analyze-db", { method: "POST" })
            const result = await response.json()

            if (!result.success) throw new Error(result.error)

            const stats = result.data
            setAnalysisStats(stats)

            Object.entries(stats).forEach(([col, data]) => {
                addLog(`Analyzed ${col}: ${data.count} docs. Subcollections: [${data.subCollections.join(", ") || "None"}]`, "info")
                if (data.hasCartArray) addLog(`ℹ️ Collection ${col} has 'cart' array field within docs.`, "warning")
            })

            addLog("Deep Database Analysis Completed", "success")

        } catch (error) {
            console.error("Analysis failed:", error)
            addLog(`Analysis failed: ${error.message}`, "error")
        } finally {
            setAnalyzing(false)
        }
    }

    const executeMigration = async (isDryRun = true) => {
        setLoading(true)
        setLogs([])
        addLog(`Starting ${isDryRun ? "DRY RUN Simulation" : "LIVE MIGRATION"}...`, "info")

        try {
            const response = await fetch("/api/migrate-db", {
                method: "POST",
                body: JSON.stringify({ dryRun: isDryRun }),
                headers: { "Content-Type": "application/json" }
            })
            const result = await response.json()

            if (!result.success) throw new Error(result.error)

            result.logs.forEach(msg => addLog(msg, msg.includes("❌") ? "error" : msg.includes("✅") ? "success" : "info"))

            if (!isDryRun) {
                addLog("LIVE MIGRATION COMPLETED SUCCESSFULLY. Please verify data.", "success")
            } else {
                addLog("Dry Run Completed. No data was changed.", "warning")
            }

        } catch (error) {
            console.error("Migration failed:", error)
            addLog(`Migration failed: ${error.message}`, "error")
        } finally {
            setLoading(false)
        }
    }

    const [cleanupConfirmation, setCleanupConfirmation] = useState("")
    const [cleaning, setCleaning] = useState(false)

    const executeCleanup = async () => {
        if (cleanupConfirmation !== "DELETE PERMANENTLY") {
            alert("Please type 'DELETE PERMANENTLY' to confirm.")
            return
        }

        setCleaning(true)
        addLog("🚨 STARTING LEGACY DATA CLEANUP...", "warning")

        try {
            const response = await fetch("/api/cleanup-db", {
                method: "POST",
                body: JSON.stringify({ confirmation: cleanupConfirmation }),
                headers: { "Content-Type": "application/json" }
            })
            const result = await response.json()

            if (!result.success) throw new Error(result.error)

            result.logs.forEach(msg => addLog(msg, "warning"))
            addLog("Cleanup Successfully Completed.", "success")
            setCleanupConfirmation("")

        } catch (error) {
            console.error("Cleanup failed:", error)
            addLog(`Cleanup failed: ${error.message}`, "error")
        } finally {
            setCleaning(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            {/* Analysis Card */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-800">
                        <Database className="w-5 h-5" />
                        Default Database Analysis
                    </CardTitle>
                    <CardDescription>
                        Inspect the <code>(default)</code> database to see existing data before migration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-center mb-4">
                        <Button
                            onClick={analyzeDefaultDB}
                            disabled={analyzing}
                            variant="outline"
                            className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                            {analyzing ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2 h-4 w-4" />}
                            Analyze (default) DB
                        </Button>
                    </div>

                    {analysisStats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {Object.entries(analysisStats).map(([key, value]) => (
                                <div key={key} className="bg-white p-3 rounded border border-blue-100 shadow-sm">
                                    <div className="text-xs text-slate-500 uppercase font-semibold">{key}</div>
                                    <div className="text-2xl font-bold text-slate-800">{value.count} <span className="text-xs font-normal text-slate-400">docs</span></div>

                                    {(value.nestedOrders > 0 || value.nestedCartItems > 0) && (
                                        <div className="mt-2 pt-2 border-t border-blue-100 flex flex-col gap-1">
                                            {value.nestedOrders > 0 && (
                                                <div className="text-xs flex justify-between">
                                                    <span className="text-slate-500">Legacy Orders:</span>
                                                    <span className="font-bold text-orange-600 bg-orange-50 px-1 rounded">{value.nestedOrders}</span>
                                                </div>
                                            )}
                                            {value.nestedCartItems > 0 && (
                                                <div className="text-xs flex justify-between">
                                                    <span className="text-slate-500">Legacy Cart:</span>
                                                    <span className="font-bold text-purple-600 bg-purple-50 px-1 rounded">{value.nestedCartItems}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-xs text-slate-400 mt-2">
                                        Subcols: {value.subCollections.length > 0 ? value.subCollections.join(", ") : "None"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                        <Trash2 className="text-orange-500" />
                        Data Maintenance: Clean Database Records
                    </CardTitle>
                    <CardDescription>
                        Scan all Court, Ball, and Paddle orders and remove polluted fields that were accidentally scraped or saved.
                        This operation maintains data integrity by removing cross-category fields.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-center mb-6">
                        <Button
                            onClick={() => executeMigration(true)}
                            disabled={loading || cleaning}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2 h-4 w-4" />}
                            Run Dry Run (Simulate)
                        </Button>

                        <Button
                            onClick={() => {
                                if (confirm("Are you sure? This will write to the PRODUCTION database.")) {
                                    executeMigration(false)
                                }
                            }}
                            disabled={loading || cleaning}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Database className="mr-2 h-4 w-4" />}
                            EXECUTE LIVE MIGRATION
                        </Button>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg">
                        <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone: Legacy Data Cleanup
                        </h3>
                        <p className="text-sm text-red-600 mb-4">
                            Once migration is verified, use this to <strong>permanently delete</strong> the old legacy collections
                            (<code>Balltestingforms</code>, <code>Paddletestingforms</code>, <code>CourtCertification</code>).
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-2 max-w-md">
                            <input
                                type="text"
                                placeholder="Type DELETE PERMANENTLY"
                                className="flex-1 px-3 py-2 border rounded text-sm text-black"
                                value={cleanupConfirmation}
                                onChange={(e) => setCleanupConfirmation(e.target.value)}
                            />
                            <Button
                                onClick={executeCleanup}
                                disabled={cleaning || cleanupConfirmation !== "DELETE PERMANENTLY"}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
                            >
                                {cleaning ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                DELETE LEGACY DATA
                            </Button>
                        </div>
                    </div>

                    <div className="bg-slate-950 text-slate-50 p-4 rounded-lg h-96 overflow-y-auto font-mono text-xs">
                        {logs.length === 0 && <span className="text-slate-500 opacity-50">Ready to start...</span>}
                        {logs.map((log) => (
                            <div key={log.id} className={`mb-1 ${log.type === "error" ? "text-red-400" :
                                log.type === "warning" ? "text-yellow-400" :
                                    log.type === "success" ? "text-green-400" : "text-slate-300"
                                }`}>
                                <span className="opacity-50 mr-2">[{new Date(log.id).toLocaleTimeString()}]</span>
                                {log.message}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
