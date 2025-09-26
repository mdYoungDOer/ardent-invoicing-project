import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { Invoice, InvoiceLineItem } from './store';

// Register fonts (you can add custom fonts here)
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Inter',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#a67c00',
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#a67c00',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  invoiceInfo: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#a67c00',
    marginBottom: 10,
  },
  invoiceDetails: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
    textAlign: 'right',
  },
  clientSection: {
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billTo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  clientInfo: {
    fontSize: 10,
    color: '#666666',
    lineHeight: 1.4,
  },
  invoiceDetailsSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailsLabel: {
    fontSize: 10,
    color: '#666666',
    fontWeight: 'bold',
  },
  detailsValue: {
    fontSize: 10,
    color: '#333333',
    marginLeft: 20,
  },
  lineItemsHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
    marginBottom: 0,
  },
  lineItemsHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },
  descriptionColumn: {
    flex: 3,
    paddingRight: 10,
  },
  quantityColumn: {
    flex: 1,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  unitPriceColumn: {
    flex: 1.5,
    textAlign: 'right',
    paddingLeft: 10,
  },
  totalColumn: {
    flex: 1.5,
    textAlign: 'right',
    paddingLeft: 10,
  },
  lineItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    alignItems: 'center',
  },
  lineItemText: {
    fontSize: 9,
    color: '#333333',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalsContainer: {
    width: '40%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 2,
  },
  totalsLabel: {
    fontSize: 10,
    color: '#666666',
  },
  totalsValue: {
    fontSize: 10,
    color: '#333333',
    fontWeight: 'bold',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#a67c00',
    marginTop: 10,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333333',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#a67c00',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#dddddd',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 1.4,
  },
  currencyNote: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeaa7',
    borderRadius: 4,
    padding: 10,
    marginTop: 20,
  },
  currencyNoteText: {
    fontSize: 9,
    color: '#856404',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

interface InvoicePDFProps {
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
  companyInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
  };
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ 
  invoice, 
  lineItems, 
  companyInfo 
}) => {
  const subtotal = lineItems.reduce((sum, item) => sum + item.total_amount, 0);
  const taxAmount = (subtotal * invoice.tax_rate) / 100;
  const discountAmount = invoice.discount_amount;
  const total = subtotal + taxAmount - discountAmount;

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      GHS: '₵',
      USD: '$',
      GBP: '£',
      EUR: '€',
      CAD: 'C$',
      AUD: 'A$',
    };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const showCurrencyNote = invoice.currency !== 'GHS' && invoice.exchange_rate;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{companyInfo.name}</Text>
            <Text style={styles.companyDetails}>
              {companyInfo.address}
              {'\n'}
              Phone: {companyInfo.phone}
              {'\n'}
              Email: {companyInfo.email}
              {companyInfo.website && `\nWebsite: ${companyInfo.website}`}
            </Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceDetails}>
              Invoice #: {invoice.invoice_number}
              {'\n'}
              Date: {formatDate(invoice.created_at)}
              {'\n'}
              Due Date: {formatDate(invoice.due_date)}
            </Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.clientSection}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.clientInfo}>
              {invoice.client_name}
              {invoice.client_email && `\n${invoice.client_email}`}
              {invoice.client_phone && `\n${invoice.client_phone}`}
              {invoice.client_address && `\n${invoice.client_address}`}
            </Text>
          </View>
          <View style={styles.invoiceDetailsSection}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Status:</Text>
              <Text style={styles.detailsValue}>{invoice.status.toUpperCase()}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Currency:</Text>
              <Text style={styles.detailsValue}>{invoice.currency}</Text>
            </View>
            {invoice.exchange_rate && (
              <View style={styles.detailsRow}>
                <Text style={styles.detailsLabel}>Exchange Rate:</Text>
                <Text style={styles.detailsValue}>1 GHS = {invoice.exchange_rate.toFixed(4)} {invoice.currency}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.lineItemsHeader}>
          <View style={styles.descriptionColumn}>
            <Text style={styles.lineItemsHeaderText}>Description</Text>
          </View>
          <View style={styles.quantityColumn}>
            <Text style={styles.lineItemsHeaderText}>Qty</Text>
          </View>
          <View style={styles.unitPriceColumn}>
            <Text style={styles.lineItemsHeaderText}>Unit Price</Text>
          </View>
          <View style={styles.totalColumn}>
            <Text style={styles.lineItemsHeaderText}>Total</Text>
          </View>
        </View>

        {lineItems.map((item, index) => (
          <View key={index} style={styles.lineItem}>
            <View style={styles.descriptionColumn}>
              <Text style={styles.lineItemText}>{item.description}</Text>
            </View>
            <View style={styles.quantityColumn}>
              <Text style={styles.lineItemText}>{item.quantity}</Text>
            </View>
            <View style={styles.unitPriceColumn}>
              <Text style={styles.lineItemText}>{formatCurrency(item.unit_price, invoice.currency)}</Text>
            </View>
            <View style={styles.totalColumn}>
              <Text style={styles.lineItemText}>{formatCurrency(item.total_amount, invoice.currency)}</Text>
            </View>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal:</Text>
              <Text style={styles.totalsValue}>{formatCurrency(subtotal, invoice.currency)}</Text>
            </View>
            
            {invoice.tax_rate > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({invoice.tax_rate}%):</Text>
                <Text style={styles.totalsValue}>{formatCurrency(taxAmount, invoice.currency)}</Text>
              </View>
            )}
            
            {discountAmount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount:</Text>
                <Text style={styles.totalsValue}>-{formatCurrency(discountAmount, invoice.currency)}</Text>
              </View>
            )}
            
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total:</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(total, invoice.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Currency Conversion Note */}
        {showCurrencyNote && (
          <View style={styles.currencyNote}>
            <Text style={styles.currencyNoteText}>
              Please pay the equivalent amount in Ghana Cedis (GHS) via Paystack.
              {'\n'}
              Current rate: 1 GHS = {invoice.exchange_rate.toFixed(4)} {invoice.currency}
              {'\n'}
              Amount due in GHS: {formatCurrency(total / (invoice.exchange_rate || 1), 'GHS')}
            </Text>
          </View>
        )}

        {/* Notes */}
        {invoice.notes && (
          <View style={{ marginTop: 30 }}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.clientInfo}>{invoice.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!
            {'\n'}
            For questions about this invoice, please contact us at {companyInfo.email}
            {'\n'}
            Payment is due within 30 days of invoice date unless otherwise specified.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
