import React, { useState } from 'react';
import { Download, FileText, Calendar, DollarSign, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface ContractGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  installmentPlans: any[];
}

export function ContractGenerator({ isOpen, onClose, installmentPlans }: ContractGeneratorProps) {
  const [selectedLotType, setSelectedLotType] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const selectedPlan = installmentPlans.find(plan => plan.lotType === selectedLotType);
  
  const getMonthlyAmount = () => {
    if (!selectedPlan || !selectedTerm) return 0;
    switch (selectedTerm) {
      case '12': return selectedPlan.monthly12;
      case '36': return selectedPlan.monthly36;
      case '60': return selectedPlan.monthly60;
      default: return 0;
    }
  };

  const generatePaymentSchedule = () => {
    if (!selectedTerm || !selectedPlan) return [];
    
    const schedule = [];
    const startDate = new Date();
    const monthlyAmount = getMonthlyAmount();
    const terms = parseInt(selectedTerm);
    
    // Down payment
    schedule.push({
      id: 0,
      type: 'Down Payment',
      amount: selectedPlan.downPayment,
      dueDate: startDate.toISOString().split('T')[0],
      status: 'pending'
    });
    
    // Monthly payments
    for (let i = 1; i <= terms; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      schedule.push({
        id: i,
        type: `Monthly Payment ${i}`,
        amount: monthlyAmount,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending'
      });
    }
    
    return schedule;
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleGenerateContract = () => {
    if (!selectedLotType || !selectedTerm || !clientName || !clientEmail || !lotNumber) {
      alert('Please fill in all required fields');
      return;
    }
    setShowPreview(true);
  };

  const handleDownloadPDF = () => {
    // In a real application, this would generate and download a PDF
    alert('Contract PDF downloaded successfully!');
  };

  const contractData = {
    contractId: `CON-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString(),
    client: { name: clientName, email: clientEmail, phone: clientPhone },
    lot: { type: selectedLotType, number: lotNumber },
    payment: {
      total: selectedPlan?.totalPrice || 0,
      downPayment: selectedPlan?.downPayment || 0,
      monthly: getMonthlyAmount(),
      terms: selectedTerm
    },
    schedule: generatePaymentSchedule()
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Generator
          </DialogTitle>
        </DialogHeader>

        {!showPreview ? (
          <div className="space-y-6">
            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Full Name *</Label>
                    <Input
                      id="clientName"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Email Address *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientPhone">Phone Number</Label>
                    <Input
                      id="clientPhone"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lotNumber">Lot Number *</Label>
                    <Input
                      id="lotNumber"
                      value={lotNumber}
                      onChange={(e) => setLotNumber(e.target.value)}
                      placeholder="e.g., A-001"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lot Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Lot & Payment Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lotType">Lot Type *</Label>
                    <Select value={selectedLotType} onValueChange={setSelectedLotType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lot type" />
                      </SelectTrigger>
                      <SelectContent>
                        {installmentPlans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.lotType}>
                            {plan.lotType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="terms">Payment Terms *</Label>
                    <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12 months</SelectItem>
                        <SelectItem value="36">36 months</SelectItem>
                        <SelectItem value="60">60 months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedPlan && selectedTerm && (
                  <div className="mt-4 p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium mb-2">Payment Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Price:</span>
                        <p className="font-medium">{formatCurrency(selectedPlan.totalPrice)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Down Payment:</span>
                        <p className="font-medium">{formatCurrency(selectedPlan.downPayment)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Monthly Payment:</span>
                        <p className="font-medium">{formatCurrency(getMonthlyAmount())}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment Term:</span>
                        <p className="font-medium">{selectedTerm} months</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerateContract} disabled={!selectedLotType || !selectedTerm || !clientName || !clientEmail || !lotNumber}>
                Generate Contract
              </Button>
            </div>
          </div>
        ) : (
          // Contract Preview
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Contract Preview</h3>
              <div className="flex gap-2">
                <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Edit
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="text-center">
                <CardTitle>DUMAGUETE MEMORIAL PARK</CardTitle>
                <p className="text-muted-foreground">Pre-Need Purchase Contract</p>
                <div className="flex justify-between items-center mt-4">
                  <Badge variant="outline">Contract ID: {contractData.contractId}</Badge>
                  <Badge variant="outline">Date: {contractData.date}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Client Details */}
                <div>
                  <h4 className="font-medium mb-2">Client Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p>{contractData.client.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p>{contractData.client.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p>{contractData.client.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lot:</span>
                      <p>{contractData.lot.number} - {contractData.lot.type}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Details */}
                <div>
                  <h4 className="font-medium mb-2">Payment Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Price:</span>
                      <p className="font-medium">{formatCurrency(contractData.payment.total)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Down Payment:</span>
                      <p className="font-medium">{formatCurrency(contractData.payment.downPayment)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Monthly Payment:</span>
                      <p className="font-medium">{formatCurrency(contractData.payment.monthly)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Payment Term:</span>
                      <p className="font-medium">{contractData.payment.terms} months</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Schedule */}
                <div>
                  <h4 className="font-medium mb-2">Payment Schedule</h4>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {contractData.schedule.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{payment.type}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-muted-foreground">{payment.dueDate}</span>
                            <span className="font-medium">{formatCurrency(payment.amount)}</span>
                            <Badge variant="outline" className="text-xs">
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Back to Edit
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}