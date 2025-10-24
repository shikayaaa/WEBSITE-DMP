import React from 'react';
import { Clock, DollarSign, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface PaymentRecord {
  id: string;
  date: string;
  type: string;
  amount: number;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  method?: string;
  reference?: string;
}

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  lotNumber: string;
  paymentHistory: PaymentRecord[];
}

export function PaymentHistoryModal({ 
  isOpen, 
  onClose, 
  clientName, 
  lotNumber, 
  paymentHistory 
}: PaymentHistoryModalProps) {
  
  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'overdue':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPaid = paymentHistory
    .filter(p => p.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const totalPending = paymentHistory
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment History - {clientName}
          </DialogTitle>
          <p className="text-muted-foreground">Lot: {lotNumber}</p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(totalPending)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="text-lg font-bold">{paymentHistory.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Timeline */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-medium mb-4">Payment Timeline</h3>
              <div className="space-y-4">
                {paymentHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No payment history found.</p>
                ) : (
                  paymentHistory.map((payment, index) => (
                    <div key={payment.id}>
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(payment.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{payment.type}</p>
                              <p className="text-sm text-muted-foreground">{payment.date}</p>
                              {payment.method && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Method: {payment.method}
                                  {payment.reference && ` | Ref: ${payment.reference}`}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold">{formatCurrency(payment.amount)}</span>
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < paymentHistory.length - 1 && (
                        <Separator className="my-4 ml-6" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Status Legend */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Status Legend</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Paid</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>Partial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Overdue</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}