import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Download, CalendarDays, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchData, type Invoice } from "@/services/api";
import { generateInvoicePDF } from "@/components/payments/InvoiceGenerator";

const PaymentInvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const data = await fetchData("/invoices/my-invoices");
        setInvoices(data.invoices || []);
      } catch (error) {
        console.error("Failed to load invoices:", error);
        toast({
          title: "Error",
          description: "Failed to load invoices. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, [toast]);

  const handleDownload = (invoice: Invoice) => {
    // TODO: Fetch user name/phone from profile API for better invoice
    generateInvoicePDF({
      invoice: { ...invoice, userEmail: "user@example.com" }, // Replace with real session email
      userName: "Member Name", // Replace with real name from profile
      userPhone: "0712345678" // Replace with real phone
    });
    toast({ 
      title: "Downloaded", 
      description: `Invoice #${invoice.id} saved as PDF` 
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="mx-auto max-w-5xl space-y-4 p-8">
          <div className="text-center">Loading invoices...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-5xl space-y-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Button>

        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 font-display text-lg">
              <FileText className="h-5 w-5 text-accent-foreground" />
              Payment Invoices ({invoices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No invoices found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="pb-3 font-medium text-muted-foreground">Invoice #</th>
                      <th className="pb-3 font-medium text-muted-foreground">Date</th>
                      <th className="pb-3 font-medium text-muted-foreground">Description</th>
                      <th className="pb-3 font-medium text-muted-foreground hidden sm:table-cell">Amount</th>
                      {/* <th className="pb-3 font-medium text-muted-foreground">Status</th> */}
                      <th className="pb-3 font-medium text-muted-foreground text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="py-3 font-medium text-foreground">INV-{inv.id.toString().padStart(3, '0')}</td>
                        <td className="py-3 text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{inv.date}</span>
                        </td>
                        <td className="py-3 text-muted-foreground">{inv.description}</td>
                        <td className="py-3 text-muted-foreground hidden sm:table-cell">
                          <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{inv.amount}</span>
                        </td>
                        {/* <td className="py-3">
                          <Badge className={inv.status === 'Paid' ? "bg-green-600" : "bg-yellow-600"}>{inv.status}</Badge>
                        </td> */}
                        <td className="py-3 text-right">
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleDownload(inv)}>
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentInvoicesPage;
