/**
 * PDF Report Generation Service
 * 
 * Generates professional clinical treatment plan reports in PDF format
 * using jsPDF and jsPDF-AutoTable for medical compliance documentation.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Extend jsPDF type to include lastAutoTable metadata from jspdf-autotable
declare module 'jspdf' {
    interface jsPDF {
        lastAutoTable?: { finalY: number };
    }
}

/**
 * jsPDF built-in fonts are not fully Unicode-safe, so we normalize text
 * to printable ASCII to prevent mojibake characters in exported PDFs.
 */
export function sanitizePdfText(value: unknown): string {
    if (value === null || value === undefined) return '';

    let text = String(value);

    const replacements: Array<[RegExp, string]> = [
        [/\u26A0/g, 'WARNING'],
        [/\uFE0F/g, ''], // variation selector
        [/\u200D/g, ''], // zero-width joiner
        [/[\u2018\u2019]/g, "'"],
        [/[\u201C\u201D]/g, '"'],
        [/[\u2013\u2014]/g, '-'],
        [/\u2026/g, '...'],
        [/\u2022/g, '-'],
        [/\u00B2/g, '2'],
        [/\u00B0/g, ' deg '],
    ];

    for (const [pattern, replacement] of replacements) {
        text = text.replace(pattern, replacement);
    }

    // Normalize common mojibake fragments to reduce random symbol artifacts.
    text = text
        .replace(/â€[˜™]/g, "'")
        .replace(/â€œ|â€\u009d/g, '"')
        .replace(/â€“|â€”/g, '-')
        .replace(/â€¢/g, '-')
        .replace(/Â/g, '');

    // Keep a strict printable whitelist to avoid stray control/symbol artifacts.
    text = text.replace(/[^A-Za-z0-9 \t\r\n.,:;/%()\-+[\]'"!?]/g, '');
    text = text.replace(/[ \t]{2,}/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
}

function withFallback(value: unknown, fallback = 'N/A'): string {
    const sanitized = sanitizePdfText(value);
    return sanitized || fallback;
}

function sanitizePdfRow(row: Array<string | number>): string[] {
    return row.map(cell => sanitizePdfText(cell));
}

function toSafeFilenamePart(value: unknown, fallback = 'Patient'): string {
    const sanitized = sanitizePdfText(value);
    const cleaned = sanitized.replace(/[^A-Za-z0-9_-]/g, '_');
    return cleaned || fallback;
}

function triggerBlobDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export interface PatientInfo {
    patientId: string;
    age: number;
    sex: string;
    weight: number;
    height: number;
    bmi: number;
    bloodPressure: { systolic: number; diastolic: number };
    heartRate: number;
    temperature: number;
}

export interface TreatmentPlanData {
    recommendations: {
        drugName: string;
        genericName?: string;
        dosage: string;
        frequency: string;
        duration?: string;
        route?: string;
        instructions?: string;
        priority?: string;
    }[];
    riskAssessment: {
        overallRisk: string;
        riskScore: number;
        confidence: number;
        riskFactors: string[];
    };
    flaggedIssues: {
        type: string;
        severity: string;
        title?: string;
        description: string;
        recommendation?: string;
        affectedDrugs?: string[];
    }[];
    rationale?: string;
    clinicalGuidelines?: string[];
    alternatives?: {
        drugName: string;
        dosage?: string;
        reason?: string;
    }[];
}

export interface MedicalHistory {
    conditions: { condition: string; severity?: string; controlled?: boolean }[];
    allergies: { allergen: string; reaction?: string; severity?: string }[];
    surgeries?: { procedure: string; date?: string }[];
    familyHistory?: string[];
}

export interface CurrentMedications {
    medications: {
        drugName: string;
        dosage: string;
        frequency: string;
        route?: string;
        prescribedBy?: string;
    }[];
}

export interface LifestyleFactors {
    chiefComplaint: string;
    smokingStatus: string;
    packYears?: number;
    alcoholUse: string;
    drinksPerWeek?: number;
    exerciseLevel: string;
    dietType?: string;
}

export interface ReportMetadata {
    generatedBy: string;
    reviewedBy?: string;
    approvalStatus: 'pending' | 'approved' | 'modified' | 'rejected';
    clinicName?: string;
    providerNPI?: string;
}

/**
 * Generate a comprehensive treatment plan PDF report
 */
export function generateTreatmentPlanPDF(
    patientInfo: PatientInfo,
    medicalHistory: MedicalHistory,
    currentMedications: CurrentMedications,
    lifestyleFactors: LifestyleFactors,
    treatmentPlan: TreatmentPlanData,
    metadata: ReportMetadata
): jsPDF {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace: number) => {
        if (yPos + requiredSpace > 270) {
            doc.addPage();
            yPos = 20;
        }
    };

    // ============================================
    // HEADER
    // ============================================
    doc.setFillColor(0, 128, 128); // Teal color
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Powered Treatment Plan Report', margin, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${format(new Date(), 'MMMM d, yyyy HH:mm')}`, margin, 25);
    doc.text(`Report ID: TPR-${Date.now().toString(36).toUpperCase()}`, pageWidth - margin - 50, 25);

    yPos = 45;
    doc.setTextColor(0, 0, 0);

    // ============================================
    // RISK ALERT BANNER (if high risk)
    // ============================================
    if (['HIGH', 'CRITICAL'].includes(treatmentPlan.riskAssessment.overallRisk.toUpperCase())) {
        doc.setFillColor(255, 200, 200);
        doc.rect(margin, yPos, pageWidth - 2 * margin, 15, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 0, 0);
        doc.text(
            `WARNING: ${sanitizePdfText(treatmentPlan.riskAssessment.overallRisk.toUpperCase())} RISK PATIENT - REVIEW CAREFULLY`,
            margin + 5,
            yPos + 10,
        );
        doc.setTextColor(0, 0, 0);
        yPos += 20;
    }

    // ============================================
    // PATIENT DEMOGRAPHICS
    // ============================================
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Information', margin, yPos);
    yPos += 7;

    autoTable(doc, {
        startY: yPos,
        head: [['Parameter', 'Value', 'Parameter', 'Value']],
        body: [
            sanitizePdfRow(['Patient ID', patientInfo.patientId || 'N/A', 'Age', `${patientInfo.age} years`]),
            sanitizePdfRow(['Sex', patientInfo.sex, 'BMI', `${patientInfo.bmi?.toFixed(1) || 'N/A'} kg/m2`]),
            sanitizePdfRow(['Weight', `${patientInfo.weight} kg`, 'Height', `${patientInfo.height} cm`]),
            sanitizePdfRow([
                'Blood Pressure',
                `${patientInfo.bloodPressure?.systolic}/${patientInfo.bloodPressure?.diastolic} mmHg`,
                'Heart Rate',
                `${patientInfo.heartRate} bpm`,
            ]),
            sanitizePdfRow(['Temperature', `${patientInfo.temperature} F`, '', '']),
        ],
        theme: 'striped',
        headStyles: { fillColor: [0, 128, 128] },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin },
    });

    yPos = (doc.lastAutoTable?.finalY || yPos) + 10;

    // ============================================
    // CHIEF COMPLAINT
    // ============================================
    checkPageBreak(30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Chief Complaint', margin, yPos);
    yPos += 7;

    doc.setFillColor(245, 245, 245);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const complaintText = withFallback(lifestyleFactors.chiefComplaint, 'Not specified');
    const splitComplaint = doc.splitTextToSize(complaintText, pageWidth - 2 * margin - 10);
    const complaintBoxHeight = Math.max(15, splitComplaint.length * 5 + 6);
    doc.rect(margin, yPos, pageWidth - 2 * margin, complaintBoxHeight, 'F');
    doc.text(splitComplaint, margin + 5, yPos + 7);
    yPos += complaintBoxHeight + 5;

    // ============================================
    // MEDICAL HISTORY
    // ============================================
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical History', margin, yPos);
    yPos += 7;

    // Conditions
    if (medicalHistory.conditions?.length > 0) {
        const conditionsBody = medicalHistory.conditions.map(c => [
            withFallback(c.condition, 'Unknown'),
            withFallback(c.severity, 'N/A'),
            c.controlled ? 'Yes' : 'No',
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Condition', 'Severity', 'Controlled']],
            body: conditionsBody,
            theme: 'striped',
            headStyles: { fillColor: [100, 100, 100] },
            styles: { fontSize: 9 },
            margin: { left: margin, right: margin },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 5;
    }

    // Allergies
    checkPageBreak(30);
    if (medicalHistory.allergies?.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Allergies', margin, yPos);
        yPos += 5;

        const allergiesBody = medicalHistory.allergies.map(a => [
            withFallback(a.allergen, 'Unknown'),
            withFallback(a.reaction, 'N/A'),
            withFallback(a.severity, 'N/A'),
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Allergen', 'Reaction', 'Severity']],
            body: allergiesBody,
            theme: 'striped',
            headStyles: { fillColor: [200, 100, 100] },
            styles: { fontSize: 9 },
            margin: { left: margin, right: margin },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 10;
    }

    // ============================================
    // CURRENT MEDICATIONS
    // ============================================
    checkPageBreak(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Current Medications', margin, yPos);
    yPos += 7;

    if (currentMedications.medications?.length > 0) {
        const medsBody = currentMedications.medications.map(m => [
            withFallback(m.drugName, 'Unknown'),
            withFallback(m.dosage, 'N/A'),
            withFallback(m.frequency, 'N/A'),
            withFallback(m.route, 'Oral'),
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Medication', 'Dosage', 'Frequency', 'Route']],
            body: medsBody,
            theme: 'striped',
            headStyles: { fillColor: [0, 100, 150] },
            styles: { fontSize: 9 },
            margin: { left: margin, right: margin },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 10;
    } else {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text('No current medications reported', margin, yPos);
        yPos += 10;
    }

    // ============================================
    // RISK ASSESSMENT
    // ============================================
    checkPageBreak(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Risk Assessment', margin, yPos);
    yPos += 7;

    // Risk score box
    const riskColor = treatmentPlan.riskAssessment.overallRisk.toUpperCase() === 'CRITICAL'
        ? [180, 0, 0]
        : treatmentPlan.riskAssessment.overallRisk.toUpperCase() === 'HIGH'
            ? [200, 100, 0]
            : treatmentPlan.riskAssessment.overallRisk.toUpperCase() === 'MEDIUM'
                ? [200, 180, 0]
                : [0, 150, 0];

    doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
    doc.roundedRect(margin, yPos, 50, 25, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('Risk Level', margin + 5, yPos + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(sanitizePdfText(treatmentPlan.riskAssessment.overallRisk.toUpperCase()), margin + 5, yPos + 20);

    // Risk score
    doc.setFillColor(60, 60, 60);
    doc.roundedRect(margin + 55, yPos, 50, 25, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Risk Score', margin + 60, yPos + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${treatmentPlan.riskAssessment.riskScore}/100`, margin + 60, yPos + 20);

    // Confidence
    doc.setFillColor(100, 100, 100);
    doc.roundedRect(margin + 110, yPos, 50, 25, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Confidence', margin + 115, yPos + 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${treatmentPlan.riskAssessment.confidence}%`, margin + 115, yPos + 20);

    doc.setTextColor(0, 0, 0);
    yPos += 35;

    // Risk factors
    if (treatmentPlan.riskAssessment.riskFactors?.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Risk Factors:', margin, yPos);
        yPos += 5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        treatmentPlan.riskAssessment.riskFactors.forEach(factor => {
            const safeFactor = sanitizePdfText(factor);
            if (!safeFactor) return;
            checkPageBreak(8);
            doc.text(`- ${safeFactor}`, margin + 5, yPos);
            yPos += 5;
        });
        yPos += 5;
    }

    // ============================================
    // FLAGGED ISSUES
    // ============================================
    if (treatmentPlan.flaggedIssues?.length > 0) {
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 0, 0);
        doc.text('Flagged Safety Issues', margin, yPos);
        doc.setTextColor(0, 0, 0);
        yPos += 7;

        treatmentPlan.flaggedIssues.forEach((issue, index) => {
            const descText = doc.splitTextToSize(
                withFallback(issue.description, 'No description available'),
                pageWidth - 2 * margin - 15,
            );
            const issueBoxHeight = Math.max(20, 14 + descText.length * 4);
            checkPageBreak(issueBoxHeight + 5);

            const severityColor = issue.severity === 'critical' ? [255, 200, 200] :
                issue.severity === 'high' ? [255, 220, 200] :
                    [255, 255, 200];

            doc.setFillColor(severityColor[0], severityColor[1], severityColor[2]);
            doc.rect(margin, yPos, pageWidth - 2 * margin, issueBoxHeight, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            const severityLabel = withFallback(issue.severity?.toUpperCase(), 'WARNING');
            const issueTitle = withFallback(issue.title || issue.type, 'Issue');
            doc.text(`${index + 1}. [${severityLabel}] ${issueTitle}`, margin + 5, yPos + 7);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.text(descText, margin + 5, yPos + 13);

            yPos += issueBoxHeight + 5;
        });
        yPos += 5;
    }

    // ============================================
    // TREATMENT RECOMMENDATIONS
    // ============================================
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Treatment Recommendations', margin, yPos);
    yPos += 10;

    if (treatmentPlan.recommendations?.length > 0) {
        treatmentPlan.recommendations.forEach((rec, index) => {
            const instructionLines = rec.instructions
                ? doc.splitTextToSize(withFallback(rec.instructions), pageWidth - 2 * margin - 15)
                : [];
            const recommendationCardHeight = Math.max(35, 24 + instructionLines.length * 4);
            checkPageBreak(recommendationCardHeight + 8);

            // Priority badge
            const priorityColor = rec.priority === 'high' ? [0, 128, 128] : [100, 100, 100];
            doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
            doc.roundedRect(margin, yPos, pageWidth - 2 * margin, recommendationCardHeight, 3, 3, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${index + 1}. ${withFallback(rec.drugName, 'Unknown Medication')}`, margin + 5, yPos + 10);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(
                `Dosage: ${withFallback(rec.dosage)} | Frequency: ${withFallback(rec.frequency)} | Route: ${withFallback(rec.route, 'Oral')}`,
                margin + 5,
                yPos + 20,
            );

            if (rec.instructions) {
                doc.setFontSize(9);
                doc.text(instructionLines, margin + 5, yPos + 28);
            }

            doc.setTextColor(0, 0, 0);
            yPos += recommendationCardHeight + 10;
        });
    }

    // ============================================
    // ALTERNATIVE TREATMENTS
    // ============================================
    const alternatives = treatmentPlan.alternatives || [];
    if (alternatives.length > 0) {
        checkPageBreak(50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Alternative Treatments', margin, yPos);
        yPos += 7;

        const altBody = alternatives.map(alt => [
            withFallback(alt.drugName),
            withFallback(alt.dosage),
            withFallback(alt.reason, 'Alternative option'),
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['Medication', 'Dosage', 'Reason']],
            body: altBody,
            theme: 'striped',
            headStyles: { fillColor: [100, 150, 100] },
            styles: { fontSize: 9 },
            margin: { left: margin, right: margin },
        });

        yPos = (doc.lastAutoTable?.finalY || yPos) + 10;
    }

    // ============================================
    // RATIONALE
    // ============================================
    if (treatmentPlan.rationale) {
        checkPageBreak(40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Clinical Rationale', margin, yPos);
        yPos += 7;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const rationaleText = doc.splitTextToSize(withFallback(treatmentPlan.rationale), pageWidth - 2 * margin);
        doc.text(rationaleText, margin, yPos);
        yPos += rationaleText.length * 5 + 10;
    }

    // ============================================
    // FOOTER - APPROVAL SECTION
    // ============================================
    doc.addPage();
    yPos = 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Provider Approval', margin, yPos);
    yPos += 15;

    // Approval status
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Status: ${withFallback(metadata.approvalStatus.toUpperCase())}`, margin, yPos);
    yPos += 10;
    doc.text(`Generated By: ${withFallback(metadata.generatedBy, 'AI Treatment Plan Assistant')}`, margin, yPos);
    yPos += 10;
    if (metadata.reviewedBy) {
        doc.text(`Reviewed By: ${withFallback(metadata.reviewedBy)}`, margin, yPos);
        yPos += 10;
    }
    yPos += 10;

    // Signature lines
    doc.setDrawColor(0, 0, 0);
    doc.line(margin, yPos + 15, margin + 80, yPos + 15);
    doc.text('Provider Signature', margin, yPos + 22);

    doc.line(margin + 100, yPos + 15, margin + 160, yPos + 15);
    doc.text('Date', margin + 100, yPos + 22);

    yPos += 40;

    // Disclaimer
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 40, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    const disclaimer = 'DISCLAIMER: This treatment plan was generated using AI-assisted clinical decision support. ' +
        'All recommendations should be reviewed and validated by a licensed healthcare provider. ' +
        'This document is not a substitute for professional medical judgment. ' +
        'The AI system is designed to assist, not replace, clinical decision-making.';
    const disclaimerText = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin - 10);
    doc.text(disclaimerText, margin + 5, yPos + 8);

    // Page numbers
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, 287);
        doc.text('CONFIDENTIAL - Protected Health Information', margin, 287);
    }

    return doc;
}

/**
 * Generate and download the PDF
 */
export function downloadTreatmentPlanPDF(
    patientInfo: PatientInfo,
    medicalHistory: MedicalHistory,
    currentMedications: CurrentMedications,
    lifestyleFactors: LifestyleFactors,
    treatmentPlan: TreatmentPlanData,
    metadata: ReportMetadata
): void {
    const doc = generateTreatmentPlanPDF(
        patientInfo,
        medicalHistory,
        currentMedications,
        lifestyleFactors,
        treatmentPlan,
        metadata
    );

    const filename = `TreatmentPlan_${toSafeFilenamePart(patientInfo.patientId)}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    try {
        const blob = doc.output('blob');
        triggerBlobDownload(blob, filename);
    } catch (error) {
        console.warn('Blob download fallback failed; using jsPDF save()', error);
        doc.save(filename);
    }
}

/**
 * Generate PDF as base64 for preview or email
 */
export function generateTreatmentPlanPDFBase64(
    patientInfo: PatientInfo,
    medicalHistory: MedicalHistory,
    currentMedications: CurrentMedications,
    lifestyleFactors: LifestyleFactors,
    treatmentPlan: TreatmentPlanData,
    metadata: ReportMetadata
): string {
    const doc = generateTreatmentPlanPDF(
        patientInfo,
        medicalHistory,
        currentMedications,
        lifestyleFactors,
        treatmentPlan,
        metadata
    );

    return doc.output('datauristring');
}

