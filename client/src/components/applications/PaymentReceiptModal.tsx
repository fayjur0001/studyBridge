"use client";

import React, { useRef } from "react";

export interface ReceiptData {
  transactionId?: string | null;
  studentName?: string | null;
  studentEmail?: string | null;
  agencyName?: string | null;
  programName?: string | null;
  universityName?: string | null;
  applicationFee?: number | string | null;
  platformCommission?: number | string | null;
  agencyShare?: number | string | null;
  paymentMethod?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  paidAt?: string | Date | null;
  status?: string | null;
}

interface PaymentReceiptModalProps {
  receipt: ReceiptData | null;
  onClose: () => void;
  showCommissionSplit?: boolean;
}

export default function PaymentReceiptModal({
  receipt,
  onClose,
  showCommissionSplit = true,
}: PaymentReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!receipt) return null;

  const fee = Number(receipt.applicationFee) || 3000;
  const commission = Number(receipt.platformCommission) || Math.round(fee * 0.1);
  const agencyShare = Number(receipt.agencyShare) || (fee - commission);

  const formattedDate = receipt.paidAt
    ? new Date(receipt.paidAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Verified on Record";

  function handlePrint() {
    window.print();
  }

  function handleDownloadText() {
    if (!receipt) return;
    const textContent = `=====================================================
STUDYBRIDGE GLOBAL EDUCATION
OFFICIAL APPLICATION PAYMENT RECEIPT
=====================================================
Receipt / Transaction ID: ${receipt.transactionId || "N/A"}
Date & Time: ${formattedDate}
Payment Status: VERIFIED & PAID

STUDENT DETAILS:
Name: ${receipt.studentName || "Student"}
Email: ${receipt.studentEmail || "N/A"}

INSTITUTION & PROGRAM:
Program: ${receipt.programName || "General Admission"}
University: ${receipt.universityName || "University"}

PROCESSING AGENCY:
Agency: ${receipt.agencyName || "StudyBridge Partner Agency"}

FINANCIAL BREAKDOWN:
Application Processing Fee: ৳${fee.toLocaleString()} BDT
${
  showCommissionSplit
    ? `Platform Commission (10%): ৳${commission.toLocaleString()} BDT\nAgency Counseling Share (90%): ৳${agencyShare.toLocaleString()} BDT\n`
    : ""
}-----------------------------------------------------
TOTAL AMOUNT PAID: ৳${fee.toLocaleString()} BDT
PAYMENT METHOD: ${receipt.paymentMethod || "SSLCommerz"} ${receipt.accountNumber ? `(${receipt.accountNumber})` : ""}
=====================================================
Thank you for using StudyBridge Global Education.
`;

    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt-${receipt.transactionId || "studybridge"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest dark:bg-[#181a20] rounded-3xl max-w-lg w-full border border-outline-variant/30 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50 no-print">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              receipt_long
            </span>
            <h3 className="font-bold text-sm text-on-surface">Payment Receipt Voucher</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div ref={receiptRef} className="p-6 overflow-y-auto space-y-6 text-on-surface">
          {/* Brand & Stamp Header */}
          <div className="flex justify-between items-start border-b border-outline-variant/20 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">
                  school
                </span>
                <span className="font-headline-sm text-headline-sm font-bold text-primary">
                  StudyBridge
                </span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                Global Education Admissions &amp; Verification Portal
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <span className="material-symbols-outlined text-[14px]">
                  verified
                </span>
                PAID &amp; VERIFIED
              </span>
              <p className="text-[10px] text-on-surface-variant mt-1 font-mono">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Trx Details Pill */}
          <div className="bg-surface-container-low p-3.5 rounded-2xl border border-outline-variant/20 space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Transaction ID:</span>
              <span className="font-mono font-bold text-primary">
                {receipt.transactionId || "TXN_APP_RECORD"}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Payment Method:</span>
              <span className="font-semibold text-on-surface">
                {receipt.paymentMethod || "SSLCommerz Online"}
                {receipt.accountNumber ? ` • ${receipt.accountNumber}` : ""}
                {receipt.bankName ? ` (${receipt.bankName})` : ""}
              </span>
            </div>
          </div>

          {/* Student & Institution Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">
                Student
              </p>
              <p className="font-bold text-on-surface text-sm">
                {receipt.studentName || "Student"}
              </p>
              <p className="text-on-surface-variant text-[11px] truncate">
                {receipt.studentEmail || ""}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">
                Assigned Agency
              </p>
              <p className="font-bold text-primary text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  support_agent
                </span>
                {receipt.agencyName || "StudyBridge Partner"}
              </p>
              <p className="text-on-surface-variant text-[11px]">
                Authorized Representative
              </p>
            </div>

            <div className="col-span-2 space-y-1 pt-1 border-t border-outline-variant/15">
              <p className="text-[10px] uppercase font-bold text-outline tracking-wider">
                Applied Program &amp; University
              </p>
              <p className="font-semibold text-on-surface">
                {receipt.programName || "Academic Program"}
              </p>
              <p className="text-on-surface-variant text-[11px]">
                {receipt.universityName || "Partner University"}
              </p>
            </div>
          </div>

          {/* Itemized Financial Breakdown Table */}
          <div className="border border-outline-variant/20 rounded-2xl overflow-hidden text-xs">
            <div className="bg-surface-container-low px-4 py-2.5 font-bold text-on-surface-variant border-b border-outline-variant/20 flex justify-between">
              <span>Item Description</span>
              <span>Amount</span>
            </div>
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-on-surface">
                    Application &amp; Counseling Processing Fee
                  </p>
                  <p className="text-[10px] text-on-surface-variant">
                    University application handling &amp; document processing
                  </p>
                </div>
                <span className="font-mono font-bold text-on-surface text-sm">
                  ৳{fee.toLocaleString()} BDT
                </span>
              </div>

              {showCommissionSplit && (
                <>
                  <div className="flex justify-between items-center pl-3 border-l-2 border-emerald-500/40 text-[11px] text-on-surface-variant">
                    <span>Platform Commission (10%)</span>
                    <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-300">
                      ৳{commission.toLocaleString()} BDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center pl-3 border-l-2 border-primary/40 text-[11px] text-on-surface-variant">
                    <span>Agency Counseling Net Share (90%)</span>
                    <span className="font-mono font-semibold text-primary">
                      ৳{agencyShare.toLocaleString()} BDT
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="bg-primary/5 dark:bg-primary/10 border-t border-outline-variant/20 px-4 py-3 flex justify-between items-center">
              <span className="font-bold text-on-surface">Total Amount Paid</span>
              <span className="font-mono font-black text-base text-primary">
                ৳{fee.toLocaleString()} BDT
              </span>
            </div>
          </div>

          <p className="text-[10px] text-center text-on-surface-variant italic">
            This is an electronically generated official voucher by StudyBridge Global Education. No physical signature required.
          </p>
        </div>

        {/* Modal Actions Footer */}
        <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between bg-surface-container-low/50 no-print">
          <button
            type="button"
            onClick={handleDownloadText}
            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">
              download
            </span>
            Download Text
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">
                print
              </span>
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-xs font-bold text-on-surface transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
