"use client"
import React, { useState } from "react"
import IndependentManualBillGenerator from "@/components/IndependentManualBillGenerator"
import IndependentInvoiceList from "@/components/IndependentInvoiceList"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function IndependentInvoicePage() {
    const [activeTab, setActiveTab] = useState("create")
    const [editingInvoice, setEditingInvoice] = useState(null)

    const handleEditInvoice = (invoice) => {
        setEditingInvoice(invoice)
        setActiveTab("create")
    }

    const handleUpdateComplete = () => {
        setEditingInvoice(null)
        setActiveTab("view")
    }

    const handleTabChange = (value) => {
        setActiveTab(value)
        if (value === "create" && !editingInvoice) {
            // Keep editing invoice if we're switching to it explicitly
        } else if (value === "view") {
            setEditingInvoice(null) // Clear editing state when going to view
        }
    }

    return (
        <div className="min-h-screen">
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    <span className="text-slate-900">Independent </span>
                    <span className="text-blue-600">Invoices</span>
                </h1>
                <p className="text-slate-600">Generate manual invoices for external or non-pickleball/paddle orders</p>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex justify-start mb-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="create">{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</TabsTrigger>
                        <TabsTrigger value="view">View Invoices</TabsTrigger>
                    </TabsList>
                </div>
                
                <TabsContent value="create" className="mt-0">
                    <IndependentManualBillGenerator 
                        initialData={editingInvoice} 
                        onUpdateComplete={handleUpdateComplete} 
                        key={editingInvoice ? editingInvoice.id : 'new'} 
                    />
                </TabsContent>
                
                <TabsContent value="view" className="mt-0">
                    <IndependentInvoiceList onEdit={handleEditInvoice} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
