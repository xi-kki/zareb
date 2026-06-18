"""
PDF Report Generator — Beautiful compliance reports using fpdf2.
"""

from io import BytesIO
from datetime import datetime
from fpdf import FPDF


class ReportPDF(FPDF):
    """Custom PDF with Kamara branding."""

    def header(self):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(22, 163, 74)
        self.cell(0, 8, "Kamara Compliance Report", align="L")
        self.set_font("Helvetica", "", 7)
        self.set_text_color(107, 114, 128)
        self.cell(0, 8, f"Generated {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", align="R", new_x="LMARGIN", new_y="NEXT")
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 7)
        self.set_text_color(156, 163, 175)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")
        self.cell(0, 10, "Kamara — Know your gaps before the auditor does.", align="R")

    def score_section(self, score: int, readiness: str):
        """Display compliance score and audit readiness."""
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(17, 24, 39)
        self.cell(0, 10, "Compliance Score", new_x="LMARGIN", new_y="NEXT")
        
        # Score box
        if score >= 80:
            color = (22, 163, 74)  # green
        elif score >= 50:
            color = (217, 119, 6)  # yellow/amber
        else:
            color = (220, 38, 38)  # red
        
        self.set_fill_color(*color)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 28)
        x = self.get_x()
        y = self.get_y()
        self.rect(x, y, 30, 30, style="F")
        self.set_xy(x + 4, y + 6)
        self.cell(22, 18, str(score), align="C")
        
        # Readiness badge
        self.set_xy(x + 36, y + 2)
        self.set_font("Helvetica", "B", 12)
        readiness_colors = {
            "AUDIT READY": (22, 163, 74),
            "MOSTLY READY": (217, 119, 6),
            "NEEDS WORK": (217, 119, 6),
            "NOT READY": (220, 38, 38),
        }
        r_color = readiness_colors.get(readiness, (220, 38, 38))
        self.set_fill_color(*r_color)
        readiness_text = readiness.replace("_", " ") if readiness else "NOT READY"
        tw = self.get_string_width(readiness_text) + 8
        self.rect(x + 36, y + 2, tw, 8, style="F")
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 8)
        self.set_xy(x + 36, y + 3)
        self.cell(tw, 6, readiness_text, align="C")
        
        self.set_y(y + 34)

    def gap_table(self, gaps: list, title: str, severity: str):
        """Render a table of gaps/issues."""
        colors = {
            "CRITICAL": (220, 38, 38),
            "MODERATE": (217, 119, 6),
            "MINOR": (37, 99, 235),
        }
        header_color = colors.get(severity, (107, 114, 128))
        
        filtered = [g for g in gaps if g.get("severity") == severity]
        if not filtered:
            return
        
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(*header_color)
        self.cell(0, 8, f"{title} ({len(filtered)})", new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(17, 24, 39)
        
        for gap in filtered[:10]:  # Max 10 per severity
            # Find available width
            page_w = self.w - 2 * self.l_margin
            col_w = page_w - 20
            
            self.set_font("Helvetica", "", 9)
            self.set_fill_color(249, 250, 251)
            y_start = self.get_y()
            
            # Section
            self.set_font("Helvetica", "B", 8)
            self.set_text_color(107, 114, 128)
            self.cell(col_w, 5, f"Section: {gap.get('section', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
            
            # Issue
            self.set_font("Helvetica", "", 9)
            self.set_text_color(17, 24, 39)
            self.multi_cell(col_w, 5, f"Issue: {gap.get('issue', '')}")
            
            # Fix
            self.set_font("Helvetica", "I", 8)
            self.set_text_color(22, 163, 74)
            self.multi_cell(col_w, 5, f"Fix: {gap.get('fix', '')}")
            
            self.ln(2)
            # Separator line
            self.set_draw_color(229, 231, 235)
            self.line(self.l_margin, self.get_y(), self.l_margin + page_w, self.get_y())
            self.ln(2)

    def recommendations_section(self, recommendations: list):
        """Render recommendations with copy-paste examples."""
        if not recommendations:
            return
        
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(22, 163, 74)
        self.cell(0, 10, "Recommendations", new_x="LMARGIN", new_y="NEXT")
        self.set_text_color(17, 24, 39)
        
        for i, rec in enumerate(recommendations[:8], 1):
            self.set_font("Helvetica", "B", 9)
            self.cell(0, 6, f"{i}. {rec.get('title', '')}", new_x="LMARGIN", new_y="NEXT")
            self.set_font("Helvetica", "", 8)
            self.set_text_color(107, 114, 128)
            self.multi_cell(self.w - 2 * self.l_margin, 4, rec.get('detail', ''))
            
            if rec.get('example_language'):
                self.set_fill_color(240, 253, 244)
                self.set_text_color(21, 128, 61)
                self.set_font("Courier", "", 7)
                example = rec['example_language'][:300]
                self.multi_cell(self.w - 2 * self.l_margin, 4, example, fill=True)
            
            self.set_text_color(17, 24, 39)
            self.ln(2)

    def export_notes_section(self, notes: str):
        """Render Africa-to-EU/UK export specific notes."""
        if not notes:
            return
        
        self.set_fill_color(255, 251, 235)
        self.set_text_color(180, 83, 9)
        self.set_font("Helvetica", "B", 9)
        
        self.cell(0, 8, "Africa to EU/UK Export Notes", new_x="LMARGIN", new_y="NEXT", fill=True)
        self.set_font("Helvetica", "", 8)
        self.set_text_color(107, 114, 128)
        self.multi_cell(self.w - 2 * self.l_margin, 4, notes, fill=True)
        self.ln(4)


async def generate_compliance_pdf(report: dict) -> BytesIO:
    """Generate a professional PDF compliance report."""
    pdf = ReportPDF()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(17, 24, 39)
    pdf.cell(0, 12, "Compliance Audit Report", new_x="LMARGIN", new_y="NEXT")
    
    # Metadata
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(107, 114, 128)
    doc = report.get("document", {})
    pdf.cell(0, 5, f"Document: {doc.get('filename', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 5, f"Standard: {report.get('standard', 'N/A')}", new_x="LMARGIN", new_y="NEXT")
    
    # Summary
    if report.get("document_summary"):
        pdf.ln(2)
        pdf.set_font("Helvetica", "I", 9)
        pdf.set_text_color(107, 114, 128)
        pdf.multi_cell(0, 5, report["document_summary"])
    
    pdf.ln(4)
    
    # Score section
    pdf.score_section(
        report.get("overall_score", 0),
        report.get("audit_readiness", "NOT READY"),
    )
    pdf.ln(4)
    
    # Critical Issues summary
    critical_issues = report.get("critical_issues", [])
    if critical_issues:
        pdf.set_fill_color(254, 242, 242)
        pdf.set_text_color(220, 38, 38)
        pdf.set_font("Helvetica", "B", 11)
        pdf.cell(0, 8, "Critical Issues Summary", new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.set_text_color(17, 24, 39)
        pdf.set_font("Helvetica", "", 9)
        for issue in critical_issues[:5]:
            pdf.set_fill_color(254, 242, 242)
            pdf.cell(5, 6, "", fill=True)
            pdf.set_font("Helvetica", "", 9)
            pdf.multi_cell(0, 6, f"  - {issue}")
        pdf.ln(4)
    
    # Gap findings by severity
    gaps = report.get("gaps_found", [])
    pdf.gap_table(gaps, "Critical Issues", "CRITICAL")
    pdf.gap_table(gaps, "Moderate Issues", "MODERATE")
    pdf.gap_table(gaps, "Minor Issues", "MINOR")
    
    # Recommendations
    pdf.recommendations_section(report.get("recommendations", []))
    
    # Export notes
    pdf.export_notes_section(report.get("export_specific_notes", ""))
    
    # Footer note
    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 7)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(0, 5, "This report is AI-generated using Groq LLM. Review by a certified food safety professional is recommended.", align="C")
    
    buf = BytesIO()
    pdf.output(buf)
    buf.seek(0)
    return buf
