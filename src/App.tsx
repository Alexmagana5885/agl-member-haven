import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MembersPage from "./pages/Members";
import MemberPaymentsPage from "./pages/MemberPayments";
import MessagesPage from "./pages/Messages";
import PaymentInvoicesPage from "./pages/PaymentInvoices";
import UserInformationPage from "./pages/UserInformation";
import PastEventDetail from "./pages/PastEventDetail";
import BlogDetail from "./pages/BlogDetail";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import RegisterIndividual from "./pages/RegisterIndividual";
import RegisterOrganisation from "./pages/RegisterOrganisation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register/individual" element={<RegisterIndividual />} />
          <Route path="/register/organisation" element={<RegisterOrganisation />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/" element={<Login />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/member-payments" element={<MemberPaymentsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/payment-invoices" element={<PaymentInvoicesPage />} />
          <Route path="/user-info" element={<UserInformationPage />} />
          <Route path="/past-events/:id" element={<PastEventDetail />} />
          <Route path="/blogs/:id" element={<BlogDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
