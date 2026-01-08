import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Download, FileText, Stamp, Calendar, CheckCircle, User, MapPin, Trash2 } from 'lucide-react';import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { collection, addDoc, getDocs, doc, updateDoc, query, orderBy, Timestamp, onSnapshot, getDoc, deleteDoc } from 'firebase/firestore';import { db, auth } from '../../firebase';
import html2canvas from 'html2canvas';

export function DeedOfSales() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTemplateDialogOpen, setEditTemplateDialogOpen] = useState(false);
  const [selectedDeed, setSelectedDeed] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateContent, setTemplateContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    clientName: '',
    lotNumber: '',
    block: '',
    amount: '',
    template: '',
    notes: ''
  });

  // State to store edited template contents
  const [templateContents, setTemplateContents] = useState<Record<string, string>>({
    'DEED OF SALE AND CERTIFICATE OF PERPETUAL CARE': `<p><strong>CERTIFICATE NO. _____</strong></p>
<p style="text-align: center;"><strong>DEED OF SALE AND CERTIFICATE OF PERPETUAL CARE</strong></p>
<p><br></p>
<p><strong>KNOW ALL MEN BY THESE PRESENTS:</strong></p>
<p>That the Dumaguete Memorial Park with principal office at Amigo Subdivision, Piapi, Dumaguete City, hereinafter called the SELLER, for and in consideration of the sum of <strong>_____ PESOS (P _____)</strong>, receipt of which in full is hereby acknowledged in full, and in receipt of <strong>_____ PESOS (P _____)</strong> as contribution to working fund, does by virtue of these presents, hereby SELL, TRANSFER, and CONVEYS to_____________________</strong>, hereinafter called the PURCHASER, of legal age, _____, and residing at_____________________Dumaguete City, Philippines, being a portion of Transfer Certificate of Title No. _____ of Register of Deeds of the City of Dumaguete, and more particularly described in the maps and lot books on file in the Office of the SELLER which are incorporated and made integral parts hereof by reference, as follows:</p>
<p><br></p>
<p>LOT: _____&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;BLOCK: _____&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SECTION: _____</p>
<p><br></p>
<p>Subject to the following conditions:</p>
<p>1. It is expressly agreed by the PURCHASER and the SELLER, the property shall be used only for interment of human remains in accordance with the rules and regulations for the time government of the cemetery.</p>
<p><br></p>
<p>2. The PURCHASER shall periodically hereinafter referred to for the government of the cemetery rules and regulations of the SELLER for the government of the cemetery now in force and those which may hereafter be adopted; that a copy of said rules and regulations and all amendments, additions and modifications thereto is kept in SELLER'S office and is subject to inspection by the PURCHASER at all times during normal office hours, said rules and regulations and all amendments, additions and modifications thereto are hereby incorporated herein and made integral parts hereof by reference as if set forth herein in full.</p>
<p><br></p>
<p>3. Flat markers of either bronze, stone or composition material, conforming to the aforesaid rules and regulations of SELLER, will be permitted to mark interments in the above described property. Also in those areas in which such structures are permitted, a memorial in the form of a monument, statue, vault, catafalque or mausoleum may be erected in conformity with the aforesaid rules and regulations of SELLER.</p>
<p><br></p>
<p>4. In the event the cemetery of SELLER, is subject to real estate tax or any special government assessment, PURCHASER shall pay SELLER promptly an amount equal to the amount of the real estate tax or special government assessment allocable to the above described property, in the due date of said tax or assessment. On default of the PURCHASER of said payment, SELLER has the option to advance the necessary amount thereof, if it so desires, and the PURCHASER is obligated to reimburse the SELLER of said amount upon demand, plus an interest thereon of 14% per annum computed from date of SELLER'S disbursement until fully paid. Any tax due on account of this agreement or on account of any subsequent document relating hereto shall be borne by the PURCHASER.</p>
<p><br></p>
<p>5. The PURCHASER may sell, transfer or assign the above described property at any time in accordance with the rules and regulations of SELLER for the time being in force.</p>
<p><br></p>
<p>6. The cemetery of SELLER being operated as a perpetual care cemetery, the SELLER hereby certifies that there has been received from PURCHASER the above-mentioned amount of <strong>_____ PESOS (P _____)</strong> as contribution to the perpetual care fund for the perpetual care of the above described property which is paid in the form of a trust in conformity with prudent cemetery management, which said contribution will be set aside and delivered to a trustee of such trust designated by SELLER (or to any other trust which SELLER may create for the perpetual care of said cemetery) to beheld in trust and invested, with any other funds of like character, the net income from which is to be used for the perpetual care of the cemetery of SELLER. As used herein the term "perpetual care" means the cutting of grass upon plots, raking and cleaning of plots, pruning shrubs and trees, and the general preservation of the plots and ground, walks, roadways, boundaries and structures, to the end that said grounds shall remain and be reasonably cared for as a cemetery ground forever.</p>
<p><br></p>
<p>7. It is distinctly understood that the SELLER has the irrevocable power to revise or cancel any existing trust and substitute it with another, or establish any trust on such terms and conditions and with such trustee of trustees as the SELLER may determine.</p>
<p><br></p>
<p>8. The terms and conditions hereof shall extend to and be binding upon the heirs, executors, administered, successors and assigns of PURCHASER and SELLER. As used herein, the singular includes the feminine, the plural and the masculine includes the feminine.</p>
<p><br></p>
<p><strong>IN WITNESS WHEREOF,</strong> the SELLER has hereunto set its hand this _____ day of _____, 20___ Dumaguete City, Neg. Or.</strong></p>
<p><br></p>

<p><strong>SIGNED IN THE PRESENCE OF: DUMAGUETE MEMORIAL PARK</strong></p><p>_____________________________&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;By_____________________________</p>
<p><strong>REPUBLIC OF THE PHILIPPINES)</strong> s.s</p>
<p>Before me, the undersigned Notary Public in and for <strong>_____________________</strong>, Philippines, personally appeared <strong>_____________________</strong>, in his capacity as <strong>_____________________</strong> of Dumaguete Memorial Park, Dumaguete City, exhibiting to me his Community Certificate No. _____, issued at _____ on _____, and with Community Certificate No. _____, issued at _____ on _____, known to me and to me known to be the same persons who executed the foregoing instrument, and acknowledged to me that they executed the same as their acts of their free will and deed.</p>
<p><br></p>
<p><strong>IN TESTIMONY WHEREOF,</strong> I have hereunto set my hand and affixed my notarial seal at _____, Philippines, on this _____ day of _____, 20___</p>
<p><br></p>
<p style="text-align: right;"><strong>_____________________</strong></p>
<p style="text-align: right;">NOTARY PUBLIC</p>
<p style="text-align: right;">Until _____</p>
<p><br></p>
<p>Doc No. _____&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Page No. _____&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Book No. _____ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Series 20 _____&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp</p>`,
'PRE-NEED PURCHASE AGREEMENT': `<p style="text-align: right;">CONTRACT NO. _____</p>
<p style="text-align: center;"><strong>DUMAGUETE MEMORIAL PARK</strong></p>
<p style="text-align: center;"><em>"A Perpetual Care Cemetery"</em></p>
<p style="text-align: center;"><strong>PRE-NEED PURCHASE AGREEMENT</strong></p>
<p>THIS AGREEMENT made on _____________________ 20_____ between DUMAGUETE MEMORIAL PARK as SELLER and _____________________ the PURCHASER.</p>
<p style="text-align: center;"><strong>WITNESSETH:</strong></p>
<p>That the PURCHASER agrees to purchase and SELLER agrees to sell to PURCHASER for interment purposes only that certain property situated within the cemetery of Seller at San Jose Extension, Dumaguete City, Philippines, and more particularly described in the maps and lot books on file in the office of the Seller as follows:</p>
<p>Lot _____, Block _____, Section _____, Lot Price P _____</p>
<p>Lot _____, Block _____, Section _____, Lot Price P _____</p>
<p style="text-align: right;">TOTAL LOT PRICE P _____</p>
<p style="text-align: right;">PERPETUAL CARE P _____</p>
<p style="text-align: right;">TOTAL LIST PRICE P _____</p>
<p>Purchaser agrees to pay to Seller in Philippine Currency P _____ as purchase price for the aforesaid property and P _____ as his contribution to the Perpetual Care Fund, the sum total of both amounts to be paid by Purchaser as follows: to wit P _____ (___%) upon signing of this agreement by Purchaser and the remainder of P _____ (___%) as down payment and the balance or the amount of P _____ is payable in equal first to twelfth (___) monthly installments every _____ day of each and every month, commencing on _____, 20_____ including interest charges on the declining balance thereof totalling twelve per cent (12%) per annum, on the _____ day of each and every month, commencing on _____ 20_____ until the entire balance has been paid. All unpaid installments shall be applied first to interest, next to the purchase price and then to the Perpetual Care Fund.</p>
<p>Time is of the essence in this agreement and it is agreed that should any of the amounts herein remain unperformed by the PURCHASER for a period of sixty (60) days after the same shall become due, or should any of the covenants or agreements herein and in the payments made prior to such re-entry shall belong to the SELLER as liquidated damages and PURCHASER hereby consents to vacate peacefully the aforesaid interment space if a breach of this contract should occur. In any event, the estate of PURCHASER shall remain bound to make payments to the SELLER for any payment which had become due and payable prior to the date of death of the PURCHASER.</p>
<p>It is agreed that if for any reason the above described interment space is not satisfactory to the PURCHASER and provided no interment has been made therein by the PURCHASER or persons approved and authorized by the PURCHASER, the said interment space may be exchanged for another space in DUMAGUETE MEMORIAL PARK. Exchange credit will be given for the amount already paid on principal and perpetual care. Interment will be subject to the terms and conditions set forth herein and subject to the rules and regulations of Seller, a copy of which may be examined at the office of Seller.</p>
<p>The PURCHASER shall not sell, transfer, or assign any interest in the above described property without the written consent of the Seller. Upon completion of all payments, including accrued interest by Purchaser, Seller will convey and deliver to Purchaser by DEED OF SALE the aforesaid property for interment of human remains only. The DEED OF SALE shall be subject to all such rules and regulations governing the cemetery of Seller, a copy of said rules and regulations and all amendments, additions and modifications is on file in Seller's office, is subject to inspection by Purchaser at all times during normal office hours and is specifically referred to and incorporated herein as if set forth herein in full. It is distinctly understood that the SELLER has the irrevocable power to revise or cancel any existing trust and substitute it with another, or establish any trust on such terms and conditions and with such trustee or trustees as the SELLER may determine. The PURCHASER agrees that he/she/they may sell, transfer, or assign this interment property at any time, subject to the rules and regulations of the Seller, and if sold, PURCHASER agrees to reimburse the SELLER for services rendered. The SELLER will not resell this property to the PURCHASER.</p>
<p>It is agreed that the cemetery of Seller is operated as a perpetual care cemetery which means that a Perpetual Care Fund in the form of an irrevocable trust has been established and that Seller will invest in such trust (or any other trust which Seller may create for the perpetual care of said cemetery) a portion of the purchase price paid by Purchaser. Seller covenants with Purchaser that the deposit by Purchaser in said fund (Perpetual Care Fund) in the amount of P _____ is a trust fund, the net income from which is to be used for the perpetual care of the cemetery of Seller. As used herein, the term "Perpetual Care" means the cutting of grass on the plots and grounds, walks, roadways, boundaries and structures, to the end that said grounds shall remain and be reasonably cared for as a cemetery ground forever.</p>
<p>PURCHASER agrees that he has read this contract as evidenced by his signature herein, that there are no verbal terms, conditions, warranties or representations other than those contained herein. THIS CONTRACT IS NOT VALID UNTIL ACCEPTED BY THE SELLER and SELLER is authorized to issue Deed of Sale as follows:</p>
<p>Name: _____________________</p>
<p>The terms and conditions hereof shall extend to and be binding upon the heirs, executors, administrators, successors and assigns of the respective parties. As used herein, the singular includes the plural and the masculine includes the feminine. The obligation and liabilities of PURCHASERS hereunder are joint and several.</p>
<p>Counselor _____</p>
<p style="text-align: right;">Purchaser _____</p>
<p>ACCEPTED ON _____, 20_____</p>
<p>Res. Cert. A _____ at _____</p>
<p>By: _____</p>
<p>Home Address: _____</p>
<p>Business Address: _____</p>
<p>Telephone: Home _____ Bus. _____</p>
<p>Map Clerk _____ Official Receipt No. _____</p>`,
'SERVICE INVOICE': `<div style="display: flex; justify-content: space-between; align-items: flex-start;">
  <div style="flex: 1;">
    <p><em>DUMAGUETE MEMORIAL PARK</em></p>
    <p>San Jose Ext. Bogo Taclobo 6200 City of Dumaguete</p>
    <p>Negros Oriental Philippines</p>
    <p><strong>GABRIEL D. AMIGO</strong> - Prop.</p>
    <p>VAT Reg. TIN # 171-188-791-00000</p>
  </div>
  <div style="text-align: right; border: 2px solid black; padding: 8px 16px;">
    <p style="margin: 0;"><strong>SERVICE</strong></p>
    <p style="margin: 0;"><strong>INVOICE</strong></p>
    <p style="margin-top: 8px;">Inv. <strong>N<sup>o</sup></strong> <span style="color: red;">_____</span></p>
    <p>DATE _____ 20___</p>
  </div>
</div>
<p><br></p>
<table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
  <tr style="border-bottom: 1px solid black;">
    <td style="padding: 4px; border-right: 1px solid black;">CUSTOMER NAME: _____________________________________________________</td>
    <td rowspan="2" style="padding: 4px; vertical-align: top; width: 35%;">
      <p style="margin: 0;"><strong>Total Sales (VAT-Inclusive)</strong></p>
      <p style="margin: 0;"><strong>Less: VAT</strong></p>
      <p style="margin: 0;"><strong>Amount: Net of VAT</strong></p>
      <p style="margin: 0;"><strong>Less: Discount</strong></p>
      <p style="margin: 0;"><strong>SC/PWD/NAAC/MOV/SP</strong></p>
    </td>
  </tr>
  <tr style="border-bottom: 1px solid black;">
    <td style="padding: 4px; border-right: 1px solid black;">Address: _____________________________________________ TIN: _________</td>
  </tr>
  <tr style="background-color: #f0f0f0; border-bottom: 1px solid black;">
    <td style="padding: 4px; border-right: 1px solid black;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <th style="text-align: left; width: 50%;"><strong>Item Description / Nature of Service</strong></th>
          <th style="text-align: center; width: 15%;"><strong>Quantity</strong></th>
          <th style="text-align: center; width: 15%;"><strong>Unit Price</strong></th>
          <th style="text-align: right; width: 20%;"><strong>Amount</strong></th>
        </tr>
      </table>
    </td>
    <td rowspan="7" style="padding: 4px; vertical-align: top;">
      <p style="margin: 0;"><strong>Add: VAT</strong></p>
      <p style="margin: 0;"><strong>Less: Withholding Tax</strong></p>
      <p style="margin: 0;"><strong>TOTAL AMOUNT DUE</strong></p>
      <p style="margin-top: 12px;"><strong>VATtable Sales</strong></p>
      <p style="margin: 0;"><strong>VAT</strong></p>
      <p style="margin: 0;"><strong>Zero-Rated Sales</strong></p>
      <p style="margin: 0;"><strong>VAT-Exempt Sales</strong></p>
    </td>
  </tr>
  <tr><td style="padding: 8px; border-right: 1px solid black; border-bottom: 1px solid black;">_________________________________________________________________</td></tr>
  <tr><td style="padding: 8px; border-right: 1px solid black; border-bottom: 1px solid black;">_________________________________________________________________</td></tr>
  <tr><td style="padding: 8px; border-right: 1px solid black; border-bottom: 1px solid black;">_________________________________________________________________</td></tr>
  <tr><td style="padding: 8px; border-right: 1px solid black; border-bottom: 1px solid black;">_________________________________________________________________</td></tr>
  <tr><td style="padding: 8px; border-right: 1px solid black; border-bottom: 1px solid black;">_________________________________________________________________</td></tr>
  <tr style="border-bottom: 1px solid black;">
    <td style="padding: 8px; text-align: right; border-right: 1px solid black;"><strong>TOTAL</strong> _____________</td>
  </tr>
  <tr>
    <td style="padding: 4px; border-right: 1px solid black;">
      <p>( ) Cash</p>
      <p>( ) Check</p>
      <p>( ) Bank transfer</p>
    </td>
    <td style="padding: 4px; vertical-align: bottom; text-align: right;">
      <p><strong>CASHIER / AUTHORIZED PERSON</strong></p>
    </td>
  </tr>
</table>
<p><br></p>
<p style="font-size: 8px; margin: 0;">50 bks (50x2) 0001-2500</p>
<p style="font-size: 8px; margin: 0;">BIR Authority to Print No. 073AU20250000006223 <strong>NOEL J. CABALLES</strong> - Prop. SC/PWD/NAAC/MOV/</p>
<p style="font-size: 8px; margin: 0;">Date of ATP: 8-16-2025 <strong>N.J CABALLES PRINTING PRESS</strong> S/N Parent ID No.</p>
<p style="font-size: 8px; margin: 0;">Accreditation No. 079MIP21230900090001 Date Issued: 02-20-2023 Expiry Date: 02-19-2026 Lower Balinguel Dumaguete City SC/PWD/NAAC/MOV/</p>
<p style="font-size: 8px; margin: 0;">225-079/9622-2332 / TIN 116-582-751-000-VAT Signatures</p>`
  });

  // Mock data
 // Real Firebase data
const [deeds, setDeeds] = useState<any[]>([]);

// Load deeds from Firebase
useEffect(() => {
  const loadDeeds = async () => {
    try {
      setLoading(true);
      
      // DEBUG: Check authentication and role
      const currentUser = auth.currentUser;
      console.log('=== DEBUGGING DEED OF SALES ===');
      console.log('Current User:', currentUser?.email);
      console.log('Current User UID:', currentUser?.uid);
      
      if (!currentUser) {
        console.error('No user logged in!');
        toast.error('Please login first');
        setLoading(false);
        return;
      }

      // Check user role in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      console.log('User document exists:', userDoc.exists());
      if (userDoc.exists()) {
        console.log('User data:', userDoc.data());
        console.log('User role:', userDoc.data()?.role);
      } else {
        console.error('User document not found in Firestore!');
      }

      // Check if user is in admins collection
      const adminDocRef = doc(db, 'admins', currentUser.uid);
      const adminDoc = await getDoc(adminDocRef);
      console.log('Is in admins collection:', adminDoc.exists());

      // Try to query deeds
      console.log('Attempting to query deedOfSales collection...');
      const deedsQuery = query(
        collection(db, 'deedOfSales'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        deedsQuery,
        (snapshot) => {
          console.log('✅ Success! Snapshot received, document count:', snapshot.size);
          
          const deedsList: any[] = [];
          
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            deedsList.push({
              id: data.deedId || docSnap.id,
              docId: docSnap.id,
              clientName: data.clientName || '',
              lotNumber: data.lotNumber || '',
              block: data.block || '',
              saleDate: data.saleDate || '',
              amount: data.amount || '',
              status: data.status || 'pending',
              notarizedBy: data.notarizedBy || '',
              registrationNumber: data.registrationNumber || '',
              titleNumber: data.titleNumber || '',
              notes: data.notes || '',
              template: data.template || '',
              createdAt: data.createdAt,
            });
          });
          
          console.log('Deeds loaded successfully:', deedsList.length);
          setDeeds(deedsList);
          setLoading(false);
        },
        (error) => {
          console.error('❌ Firebase snapshot error:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          
          if (error.code === 'permission-denied') {
            toast.error('Permission Denied', {
              description: 'Your account does not have permission to view deeds. Please contact an administrator.'
            });
          } else {
            toast.error('Failed to load deeds', {
              description: error.message
            });
          }
          
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error: any) {
      console.error('❌ Error in loadDeeds:', error);
      toast.error('Failed to load deeds', {
        description: error.message || 'An unexpected error occurred'
      });
      setLoading(false);
    }
  };

  loadDeeds();
}, []);

  const filteredDeeds = deeds.filter(deed => {
    const matchesSearch = deed.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deed.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deed.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || deed.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

const stats = {
  totalDeeds: deeds.length,
  completed: deeds.filter(d => d.status === 'completed').length,
  pending: deeds.filter(d => d.status === 'pending').length,
  totalValue: (() => {
    const total = deeds.reduce((sum, deed) => {
      // Safely parse amount, handling both string and number formats
      let amount = 0;
      if (typeof deed.amount === 'string') {
        amount = parseFloat(deed.amount.replace(/[₱,\s]/g, '')) || 0;
      } else if (typeof deed.amount === 'number') {
        amount = deed.amount;
      }
      return sum + amount;
    }, 0);
    // Format with peso sign and commas
    return `₱${total.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  })()
};
// ADD THIS LOADING CHECK HERE ↓
if (loading) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading deeds...</p>
      </div>
    </div>
  );
}

const handleCreateDeed = async () => {
  try {
    if (!formData.clientName || !formData.lotNumber || !formData.block || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Get all deeds for this year to generate next ID
    const currentYearDeeds = deeds.filter(deed => 
      deed.id.startsWith(`DOS-${currentYear}`)
    );
    
    const nextNumber = currentYearDeeds.length + 1;
    const deedId = `DOS-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
    
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const newDeed = {
      deedId: deedId,
      clientName: formData.clientName,
      lotNumber: formData.lotNumber,
      block: formData.block,
      saleDate: today,
      amount: formData.amount,
      status: 'pending',
      notarizedBy: '',
      registrationNumber: '',
      titleNumber: '',
      notes: formData.notes,
      template: formData.template,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    await addDoc(collection(db, 'deedOfSales'), newDeed);

    toast.success('Deed of Sale created successfully', {
      description: `${deedId} has been generated and is ready for notarization`
    });

    // Reset form
    setFormData({
      clientName: '',
      lotNumber: '',
      block: '',
      amount: '',
      template: '',
      notes: ''
    });

    setCreateDialogOpen(false);
  } catch (error) {
    console.error('Error creating deed:', error);
    toast.error('Failed to create deed');
  }
};

  const handleViewDeed = (deed: any) => {
    setSelectedDeed(deed);
    setViewDialogOpen(true);
  };

 const handleEditDeed = (deed: any) => {
  setSelectedDeed(deed);
  // Pre-populate the form with current deed data
  setFormData({
    clientName: deed.clientName,
    lotNumber: deed.lotNumber,
    block: deed.block,
    amount: deed.amount,
    template: deed.template || '',
    notes: deed.notes || ''
  });
  setEditDialogOpen(true);
};
const handleSaveEdit = async () => {
  try {
    if (!selectedDeed?.docId) {
      toast.error('Invalid deed selected');
      return;
    }

    // Validate required fields
    if (!formData.clientName || !formData.lotNumber || !formData.block || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const deedRef = doc(db, 'deedOfSales', selectedDeed.docId);
    
    await updateDoc(deedRef, {
      clientName: formData.clientName,
      lotNumber: formData.lotNumber,
      block: formData.block,
      amount: formData.amount,
      notes: formData.notes,
      updatedAt: Timestamp.now(),
    });

    toast.success('Deed updated successfully', {
      description: 'All changes have been saved to database'
    });

    // Reset form data
    setFormData({
      clientName: '',
      lotNumber: '',
      block: '',
      amount: '',
      template: '',
      notes: ''
    });

    setEditDialogOpen(false);
    setSelectedDeed(null);
  } catch (error) {
    console.error('Error updating deed:', error);
    toast.error('Failed to update deed', {
      description: 'Please try again or contact support'
    });
  }
};

const handleNotarize = async (deed: any) => {
  try {
    const deedRef = doc(db, 'deedOfSales', deed.docId);
    
    await updateDoc(deedRef, {
      status: 'completed',
      updatedAt: Timestamp.now(),
    });

    toast.success('Deed notarized', {
      description: `${deed.id} has been marked as completed`
    });
  } catch (error) {
    console.error('Error notarizing deed:', error);
    toast.error('Failed to update deed status');
  }
};

// ADD YOUR DELETE FUNCTION HERE ↓↓↓
const handleDeleteDeed = async (deed: any) => {
  try {
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete deed ${deed.id}?\n\nClient: ${deed.clientName}\nLot: ${deed.lotNumber}\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    const deedRef = doc(db, 'deedOfSales', deed.docId);
    await deleteDoc(deedRef);

    toast.success('Deed deleted successfully', {
      description: `${deed.id} has been permanently removed`
    });
  } catch (error) {
    console.error('Error deleting deed:', error);
    toast.error('Failed to delete deed', {
      description: 'Please try again or contact support'
    });
  }
};
// ADD YOUR DELETE FUNCTION HERE ↑↑↑

  const handleEditTemplate = (templateName: string) => {
    setSelectedTemplate(templateName);
    // Load the current template content from state
    setTemplateContent(templateContents[templateName] || '');
    setEditTemplateDialogOpen(true);
  };

 const handleDownloadTemplate = (templateName: string) => {
    const content = templateContents[templateName] || '';
    
    if (!content) {
      toast.error('Template not found');
      return;
    }
    
    // Create PDF with Legal size (long bond paper: 8.5" x 14")
    const doc = new jsPDF({
      format: 'legal'
    });
    
    const parseHtmlToPdf = (htmlContent: string) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      
      let y = 10;
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const leftMargin = 10;
      const rightMargin = 10;
      const maxWidth = pageWidth - leftMargin - rightMargin;
      const lineSpacing = 4.2;
      
      const justifyLine = (words: string[], width: number, x: number, yPos: number) => {
        if (words.length === 1) {
          doc.text(words[0], x, yPos);
          return;
        }
        
        const totalWordsWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
        const totalSpaceWidth = width - totalWordsWidth;
        const spaceWidth = totalSpaceWidth / (words.length - 1);
        
        let currentX = x;
        words.forEach((word, idx) => {
          doc.text(word, currentX, yPos);
          if (idx < words.length - 1) {
            currentX += doc.getTextWidth(word) + spaceWidth;
          }
        });
      };
      
      const processElement = (element: HTMLElement, parentAlign: string = 'justify') => {
        const tagName = element.tagName.toLowerCase();
        const style = element.getAttribute('style') || '';
        const alignMatch = style.match(/text-align:\s*(left|center|right|justify)/);
        const align = alignMatch ? alignMatch[1] : parentAlign;
        
        if (tagName === 'p') {
          const textContent = element.textContent?.trim();
          
          if (!textContent) {
            y += lineSpacing;
            return;
          }
          
          // Build complete paragraph text with formatting markers
          let paragraphParts: Array<{text: string, bold: boolean}> = [];
          
          const collectText = (node: Node, isBold: boolean = false) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent || '';
              if (text.trim()) {
                paragraphParts.push({ text: text, bold: isBold });
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const elTag = el.tagName.toLowerCase();
              const newBold = isBold || elTag === 'strong' || elTag === 'b';
              Array.from(el.childNodes).forEach(child => collectText(child, newBold));
            }
          };
          
          Array.from(element.childNodes).forEach(node => collectText(node));
          
          // Now render the paragraph with proper justification
          let currentLine = '';
          let currentLineWords: Array<{text: string, bold: boolean}> = [];
          
          const renderLine = (isLast: boolean = false) => {
            if (currentLineWords.length === 0) return;
            
            if (y > pageHeight - 20) {
              doc.addPage();
              y = 13;
            }
            
            if (align === 'center') {
              const lineText = currentLineWords.map(w => w.text).join(' ');
              doc.setFont('times', currentLineWords[0].bold ? 'bold' : 'normal');
              doc.setFontSize(10.5);
              const textWidth = doc.getTextWidth(lineText);
              const xPos = (pageWidth - textWidth) / 2;
              doc.text(lineText, xPos, y);
            } else if (align === 'right') {
              const lineText = currentLineWords.map(w => w.text).join(' ');
              doc.setFont('times', currentLineWords[0].bold ? 'bold' : 'normal');
              doc.setFontSize(10.5);
              const textWidth = doc.getTextWidth(lineText);
              const xPos = pageWidth - rightMargin - textWidth;
              doc.text(lineText, xPos, y);
            } else {
              // Justify
              if (isLast) {
                // Last line - left aligned
                let xPos = leftMargin;
                currentLineWords.forEach(word => {
                  doc.setFont('times', word.bold ? 'bold' : 'normal');
                  doc.setFontSize(10.5);
                  doc.text(word.text, xPos, y);
                  xPos += doc.getTextWidth(word.text + ' ');
                });
              } else {
                // Justify the line
                const wordsText = currentLineWords.map(w => w.text);
                doc.setFont('times', currentLineWords[0].bold ? 'bold' : 'normal');
                doc.setFontSize(10.5);
                justifyLine(wordsText, maxWidth, leftMargin, y);
              }
            }
            
            y += lineSpacing;
            currentLineWords = [];
            currentLine = '';
          };
          
          // Split into lines respecting formatting
          paragraphParts.forEach((part, partIdx) => {
            const words = part.text.trim().split(/\s+/);
            
            words.forEach((word, wordIdx) => {
              const testLine = currentLine + (currentLine ? ' ' : '') + word;
              doc.setFont('times', part.bold ? 'bold' : 'normal');
              doc.setFontSize(10.5);
              
              if (doc.getTextWidth(testLine) > maxWidth && currentLine) {
                renderLine(false);
              }
              
              currentLine += (currentLine ? ' ' : '') + word;
              currentLineWords.push({ text: word, bold: part.bold });
            });
          });
          
          if (currentLine) {
            renderLine(true);
          }
          
        } else if (tagName === 'br') {
          y += lineSpacing;
        } else {
          Array.from(element.children).forEach(child => {
            processElement(child as HTMLElement, align);
          });
        }
      };
      
      Array.from(tempDiv.children).forEach(child => {
        processElement(child as HTMLElement);
      });
    };
    
    parseHtmlToPdf(content);
    doc.save(`${templateName.replace(/\s+/g, '_')}.pdf`);
    
    toast.success('Template downloaded successfully', {
      description: `${templateName} has been downloaded as PDF on legal-size paper`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Deed of Sale</h2>
          <p className="text-muted-foreground">Manage property transfer documents and templates</p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Create New Deed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Deed of Sale</DialogTitle>
              <DialogDescription>Enter the details for the new deed of sale document</DialogDescription>
            </DialogHeader>
         <div className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="client-name">Client Name *</Label>
      <Input 
        id="client-name" 
        placeholder="Enter client name"
        value={formData.clientName}
        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="lot-number">Lot Number *</Label>
      <Input 
        id="lot-number" 
        placeholder="e.g., A-125"
        value={formData.lotNumber}
        onChange={(e) => setFormData({...formData, lotNumber: e.target.value})}
      />
    </div>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="block">Block/Section *</Label>
      <Input 
        id="block" 
        placeholder="e.g., Section A"
        value={formData.block}
        onChange={(e) => setFormData({...formData, block: e.target.value})}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="amount">Sale Amount *</Label>
      <Input 
        id="amount" 
        placeholder="₱"
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
      />
    </div>
  </div>
  <div className="space-y-2">
    <Label htmlFor="template">Template</Label>
    <Select 
      value={formData.template}
      onValueChange={(value) => setFormData({...formData, template: value})}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select template" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DEED OF SALE AND CERTIFICATE OF PERPETUAL CARE">Deed of Sale & Perpetual Care</SelectItem>
        <SelectItem value="PRE-NEED PURCHASE AGREEMENT">Pre-Need Purchase Agreement</SelectItem>
        <SelectItem value="SERVICE INVOICE">Service Invoice</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="space-y-2">
    <Label htmlFor="notes">Additional Notes</Label>
    <Textarea 
      id="notes" 
      rows={3}
      value={formData.notes}
      onChange={(e) => setFormData({...formData, notes: e.target.value})}
    />
  </div>
</div>
        
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateDeed} className="bg-blue-600 hover:bg-blue-700">Generate Deed</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deeds</p>
                <p className="text-2xl font-bold">{stats.totalDeeds}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{stats.totalValue}</p>
              </div>
              <Stamp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deeds" className="w-full">
        <TabsList>
          <TabsTrigger value="deeds">Deeds Registry</TabsTrigger>
          <TabsTrigger value="templates">Document Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="deeds" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by client name, lot number, or deed ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deed ID</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Lot Number</TableHead>
                    <TableHead>Block/Section</TableHead>
                    <TableHead>Sale Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeeds.map((deed) => (
                    <TableRow key={deed.id}>
                      <TableCell className="font-medium">{deed.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {deed.clientName}
                        </div>
                      </TableCell>
                      <TableCell>{deed.lotNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {deed.block}
                        </div>
                      </TableCell>
                      <TableCell>{deed.saleDate}</TableCell>
                      <TableCell className="font-medium">{deed.amount}</TableCell>
                      <TableCell>
                        <Badge variant={deed.status === 'completed' ? 'default' : 'secondary'}>
                          {deed.status}
                        </Badge>
                      </TableCell>
                  <TableCell>
  <div className="flex items-center gap-2">
    <Button variant="ghost" size="sm" onClick={() => handleViewDeed(deed)}>
      <Eye className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="sm" onClick={() => handleEditDeed(deed)}>
      <Edit className="h-4 w-4" />
    </Button>
    {deed.status === 'pending' && (
      <Button variant="ghost" size="sm" onClick={() => handleNotarize(deed)}>
        <Stamp className="h-4 w-4" />
      </Button>
    )}
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={() => handleDeleteDeed(deed)}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  </div>
</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Templates</CardTitle>
              <p className="text-sm text-muted-foreground">Manage deed of sale document templates and formats</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <h3 className="font-semibold">DEED OF SALE AND CERTIFICATE OF PERPETUAL CARE</h3>
                      <p className="text-sm text-muted-foreground">Official deed of sale with perpetual care certificate</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-[1.2]" onClick={() => handleEditTemplate('DEED OF SALE AND CERTIFICATE OF PERPETUAL CARE')}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownloadTemplate('DEED OF SALE AND CERTIFICATE OF PERPETUAL CARE')}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <h3 className="font-semibold">PRE-NEED PURCHASE AGREEMENT</h3>
                      <p className="text-sm text-muted-foreground">Pre-need purchase agreement for cemetery lots</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-[1.2]" onClick={() => handleEditTemplate('PRE-NEED PURCHASE AGREEMENT')}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownloadTemplate('PRE-NEED PURCHASE AGREEMENT')}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-2 hover:border-blue-200 transition-colors">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <h3 className="font-semibold">SERVICE INVOICE</h3>
                      <p className="text-sm text-muted-foreground">Service invoice for cemetery services and transactions</p>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-[1.2]" onClick={() => handleEditTemplate('SERVICE INVOICE')}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDownloadTemplate('SERVICE INVOICE')}>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    {/* View Dialog */}
<Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
  <DialogContent className="max-w-3xl">
    <DialogHeader>
      <DialogTitle>Deed of Sale Details</DialogTitle>
      <DialogDescription>Complete information for {selectedDeed?.id}</DialogDescription>
    </DialogHeader>
    {selectedDeed && (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* ✅ UPDATED SECTION STARTS HERE */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Deed ID</Label>
                <p className="font-medium">{selectedDeed.id}</p>
              </div>
              {selectedDeed.contractId && (
                <div>
                  <Label className="text-muted-foreground">Pre-Need Contract</Label>
                  <Badge variant="outline" className="font-mono">
                    {selectedDeed.contractId}
                  </Badge>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Client Name</Label>
                <p className="font-medium">{selectedDeed.clientName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Sale Date</Label>
                <p className="font-medium">{selectedDeed.saleDate}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-medium text-lg">{selectedDeed.amount}</p>
              </div>
            </div>
          </div>
          {/* ✅ UPDATED SECTION ENDS HERE */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Property Details</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-muted-foreground">Lot Number</Label>
                      <p className="font-medium">{selectedDeed.lotNumber}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Block/Section</Label>
                      <p className="font-medium">{selectedDeed.block}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <Badge variant={selectedDeed.status === 'completed' ? 'default' : 'secondary'}>
                        {selectedDeed.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Legal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Notarized By</Label>
                    <p className="font-medium">{selectedDeed.notarizedBy || 'Pending'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Registration Number</Label>
                    <p className="font-medium">{selectedDeed.registrationNumber || 'Pending'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Title Number</Label>
                    <p className="font-medium">{selectedDeed.titleNumber || 'Pending'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-muted-foreground">Notes</Label>
                <p>{selectedDeed.notes}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              handleEditDeed(selectedDeed);
            }} className="bg-blue-600 hover:bg-blue-700">Edit Deed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Deed of Sale</DialogTitle>
            <DialogDescription>Update the details for {selectedDeed?.id}</DialogDescription>
          </DialogHeader>
          {selectedDeed && (
            <div className="space-y-6">
   <div className="space-y-4">
  <h4 className="font-medium">Basic Information</h4>
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-2">
      <Label htmlFor="edit-client">Client Name *</Label>
      <Input 
        id="edit-client" 
        value={formData.clientName}
        onChange={(e) => setFormData({...formData, clientName: e.target.value})}
        placeholder="Enter client name"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="edit-lot">Lot Number *</Label>
      <Input 
        id="edit-lot" 
        value={formData.lotNumber}
        onChange={(e) => setFormData({...formData, lotNumber: e.target.value})}
        placeholder="e.g., A-125"
      />
    </div>
  </div>
  <div className="grid grid-cols-2 gap-3">
    <div className="space-y-2">
      <Label htmlFor="edit-block">Block/Section *</Label>
      <Input 
        id="edit-block" 
        value={formData.block}
        onChange={(e) => setFormData({...formData, block: e.target.value})}
        placeholder="e.g., Section A"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="edit-amount">Amount *</Label>
      <Input 
        id="edit-amount" 
        value={formData.amount}
        onChange={(e) => setFormData({...formData, amount: e.target.value})}
        placeholder="₱"
      />
    </div>
  </div>
</div>
<Separator />
<div className="space-y-2">
  <Label htmlFor="edit-notes">Notes</Label>
  <Textarea 
    id="edit-notes" 
    value={formData.notes}
    onChange={(e) => setFormData({...formData, notes: e.target.value})}
    rows={3}
    placeholder="Additional notes..."
  />
</div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={editTemplateDialogOpen} onOpenChange={setEditTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template - {selectedTemplate}</DialogTitle>
            <DialogDescription>Use the rich text editor to format your template with bold text, spacing, and more</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Template Content</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <div className="border rounded-md">
                      <ReactQuill 
                        theme="snow"
                        value={templateContent} 
                        onChange={setTemplateContent}
                        style={{ minHeight: '400px' }}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            [{ 'indent': '-1'}, { 'indent': '+1' }],
                            [{ 'align': [] }],
                            ['clean']
                          ]
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplateDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              // The content is already in templateContent state from ReactQuill
              if (selectedTemplate && templateContent) {
                // Update the template content in state
                setTemplateContents({
                  ...templateContents,
                  [selectedTemplate]: templateContent
                });
                
                toast.success('Template updated successfully', {
                  description: 'All changes have been saved'
                });
              }
              
              setEditTemplateDialogOpen(false);
            }} className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}