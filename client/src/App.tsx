import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoanProvider } from "@/context/LoanContext";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import LoansPage from "@/pages/loans";
import NewLoanPage from "@/pages/loans/new";
import LoanDetailsPage from "@/pages/loans/[id]";
import EditLoanPage from "@/pages/loans/[id]/edit";
import NewPaymentPage from "@/pages/loans/[id]/payment";
import BorrowersPage from "@/pages/borrowers";
import NewBorrowerPage from "@/pages/borrowers/new";
import BorrowerDetailsPage from "@/pages/borrowers/[id]";
import PaymentsPage from "@/pages/payments";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/loans" component={LoansPage} />
      <Route path="/loans/new" component={NewLoanPage} />
      <Route path="/loans/:id" component={LoanDetailsPage} />
      <Route path="/loans/:id/edit" component={EditLoanPage} />
      <Route path="/loans/:id/payment" component={NewPaymentPage} />
      <Route path="/borrowers" component={BorrowersPage} />
      <Route path="/borrowers/new" component={NewBorrowerPage} />
      <Route path="/borrowers/:id" component={BorrowerDetailsPage} />
      <Route path="/payments" component={PaymentsPage} />
      <Route path="/reports" component={ReportsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoanProvider>
          <Toaster />
          <Router />
        </LoanProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
