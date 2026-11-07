import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from app.schemas.analysis import FullAnalysisResponse

class ReportService:
    @staticmethod
    def generate_pdf_report(analysis: FullAnalysisResponse, document_title: str = "Document Analysis Report") -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )
        styles = getSampleStyleSheet()

        # Custom typography styles
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#101827'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )
        section_style = ParagraphStyle(
            'SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        alert_style = ParagraphStyle(
            'Alert',
            parent=styles['Normal'],
            fontSize=9,
            leading=13,
            textColor=colors.HexColor('#475569')
        )

        elements = []

        # Header
        elements.append(Paragraph("<b>TrustWrite</b> &mdash; Writing Intelligence Report", title_style))
        elements.append(Paragraph(f"Document: <b>{document_title}</b> | Generated on {datetime.now(timezone.utc).strftime('%B %d, %Y')}", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=15))

        # Overall Score Card
        score_data = [
            [
                Paragraph(f"<b>Overall Writing Quality</b><br/><font size=20 color='#2563EB'><b>{analysis.overall_score} / 100</b></font>", body_style),
                Paragraph(f"<b>Reading Level</b><br/><font size=14 color='#101827'><b>Grade {analysis.metrics.flesch_kincaid_grade}</b> ({analysis.metrics.flesch_reading_ease_label})</font>", body_style),
                Paragraph(f"<b>AI Pattern Status</b><br/><font size=11 color='#7C3AED'><b>{analysis.ai_signals.overall_status}</b></font>", body_style)
            ]
        ]
        score_table = Table(score_data, colWidths=[170, 180, 180])
        score_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#E2E8F0')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0,0), (-1,-1), 10),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('LEFTPADDING', (0,0), (-1,-1), 12),
            ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ]))
        elements.append(score_table)
        elements.append(Spacer(1, 15))

        # Readability Metrics Table
        elements.append(Paragraph("<b>Readability & Structural Metrics</b>", section_style))
        metrics_data = [
            ["Metric", "Value", "Metric", "Value"],
            ["Total Word Count", str(analysis.metrics.word_count), "Sentences", str(analysis.metrics.sentence_count)],
            ["Avg Sentence Length", f"{analysis.metrics.avg_sentence_length} words", "Paragraphs", str(analysis.metrics.paragraph_count)],
            ["Flesch Reading Ease", f"{analysis.metrics.flesch_reading_ease} / 100", "Gunning Fog Index", str(analysis.metrics.gunning_fog_index)],
            ["Passive Sentences", str(analysis.metrics.passive_voice_count), "Transition Words", str(analysis.metrics.transition_word_count)],
            ["Est. Reading Time", f"{analysis.metrics.reading_time_minutes} min", "Complex Words", str(analysis.metrics.complex_word_count)],
        ]
        metrics_table = Table(metrics_data, colWidths=[150, 115, 150, 115])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(metrics_table)
        elements.append(Spacer(1, 15))

        # Grammar & Spell Findings
        elements.append(Paragraph(f"<b>Grammar & Writing Corrections ({len(analysis.grammar_findings)} found)</b>", section_style))
        if analysis.grammar_findings:
            gf_data = [["Category", "Original Passage", "Recommendation", "Explanation"]]
            for gf in analysis.grammar_findings[:8]: # Display top 8 in PDF
                gf_data.append([
                    gf.category.capitalize(),
                    gf.original[:25],
                    gf.suggestion[:25],
                    gf.explanation[:45] + ("..." if len(gf.explanation) > 45 else "")
                ])
            gf_table = Table(gf_data, colWidths=[80, 120, 120, 210])
            gf_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F8FAFC')),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 6),
                ('RIGHTPADDING', (0,0), (-1,-1), 6),
                ('FONTSIZE', (0,0), (-1,-1), 8),
            ]))
            elements.append(gf_table)
        else:
            elements.append(Paragraph("No critical spelling or grammar errors detected. Text appears clean and well structured.", body_style))
        elements.append(Spacer(1, 15))

        # Ethical AI Writing Signals Review
        elements.append(Paragraph("<b>AI Writing Pattern Review & Transparency</b>", section_style))
        disclaimer_box = [
            [Paragraph(f"<b>Ethical Policy:</b> {analysis.ai_signals.disclaimer}", alert_style)]
        ]
        dt = Table(disclaimer_box, colWidths=[530])
        dt.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#EFF6FF')),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#BFDBFE')),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(dt)
        elements.append(Spacer(1, 15))

        # Citations & References
        elements.append(Paragraph("<b>Citation & Source Verification</b>", section_style))
        c_text = (
            f"In-text citations found: <b>{analysis.citations.in_text_citations_found}</b> &nbsp;|&nbsp; "
            f"Bibliography entries found: <b>{analysis.citations.bibliography_entries_found}</b>"
        )
        elements.append(Paragraph(c_text, body_style))
        if analysis.citations.unmatched_in_text_citations:
            elements.append(Spacer(1, 4))
            for u in analysis.citations.unmatched_in_text_citations[:3]:
                elements.append(Paragraph(f"&bull; <i>Warning:</i> {u}", alert_style))

        # Actionable Checklist
        elements.append(Spacer(1, 15))
        elements.append(Paragraph("<b>Improvement Checklist</b>", section_style))
        checklist = [
            "&check; Review highlighted grammar and phrasing suggestions above.",
            "&check; Ensure complex and passive sentences are balanced with crisp, direct statements.",
            "&check; Confirm all in-text citations correspond directly to a valid entry in the References list.",
            "&check; Verify formatting and tone meets the intended audience guidelines."
        ]
        for item in checklist:
            elements.append(Paragraph(item, body_style))

        # Build document
        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
