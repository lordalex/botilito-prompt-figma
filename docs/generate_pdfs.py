#!/usr/bin/env python3
"""
Generate PDFs from Markdown files for Botilito documentation.
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_CENTER
import re
import os

def parse_markdown_to_elements(md_content, styles):
    """Parse markdown content and convert to reportlab elements."""
    elements = []
    lines = md_content.split('\n')

    i = 0
    in_code_block = False
    code_content = []
    in_table = False
    table_rows = []

    while i < len(lines):
        line = lines[i]

        # Handle code blocks
        if line.strip().startswith('```'):
            if in_code_block:
                # End code block
                code_text = '\n'.join(code_content)
                if code_text.strip():
                    elements.append(Spacer(1, 6))
                    code_style = ParagraphStyle(
                        'Code',
                        parent=styles['Normal'],
                        fontName='Courier',
                        fontSize=7,
                        leading=9,
                        leftIndent=10,
                        rightIndent=10,
                        backColor=colors.Color(0.95, 0.95, 0.95),
                        borderColor=colors.Color(0.8, 0.8, 0.8),
                        borderWidth=1,
                        borderPadding=5,
                    )
                    # Escape special characters for XML
                    code_text = code_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                    elements.append(Preformatted(code_text, code_style))
                    elements.append(Spacer(1, 6))
                in_code_block = False
                code_content = []
            else:
                # Start code block
                in_code_block = True
            i += 1
            continue

        if in_code_block:
            code_content.append(line)
            i += 1
            continue

        # Handle tables
        if '|' in line and not line.strip().startswith('```'):
            cells = [c.strip() for c in line.split('|')]
            cells = [c for c in cells if c]  # Remove empty cells

            if cells and not all(c.replace('-', '').replace(':', '') == '' for c in cells):
                if not in_table:
                    in_table = True
                    table_rows = []
                table_rows.append(cells)
            elif in_table and all(c.replace('-', '').replace(':', '') == '' for c in cells):
                # This is a separator row, skip it
                pass
            i += 1
            continue
        elif in_table:
            # End of table
            if table_rows:
                elements.append(Spacer(1, 6))
                elements.append(create_table(table_rows, styles))
                elements.append(Spacer(1, 6))
            in_table = False
            table_rows = []

        # Handle headers
        if line.startswith('# '):
            text = clean_text(line[2:])
            elements.append(Spacer(1, 12))
            elements.append(Paragraph(text, styles['Heading1']))
            elements.append(Spacer(1, 6))
        elif line.startswith('## '):
            text = clean_text(line[3:])
            elements.append(Spacer(1, 10))
            elements.append(Paragraph(text, styles['Heading2']))
            elements.append(Spacer(1, 4))
        elif line.startswith('### '):
            text = clean_text(line[4:])
            elements.append(Spacer(1, 8))
            elements.append(Paragraph(text, styles['Heading3']))
            elements.append(Spacer(1, 3))
        elif line.startswith('#### '):
            text = clean_text(line[5:])
            elements.append(Spacer(1, 6))
            elements.append(Paragraph(f"<b>{text}</b>", styles['Normal']))
            elements.append(Spacer(1, 2))
        elif line.startswith('> '):
            # Blockquote
            text = clean_text(line[2:])
            quote_style = ParagraphStyle(
                'Quote',
                parent=styles['Normal'],
                leftIndent=20,
                rightIndent=20,
                textColor=colors.Color(0.4, 0.4, 0.4),
                fontName='Helvetica-Oblique',
            )
            elements.append(Paragraph(text, quote_style))
        elif line.startswith('- ') or line.startswith('* '):
            # Bullet point
            text = clean_text(line[2:])
            bullet_style = ParagraphStyle(
                'Bullet',
                parent=styles['Normal'],
                leftIndent=20,
                bulletIndent=10,
            )
            elements.append(Paragraph(f"• {text}", bullet_style))
        elif line.strip().startswith(tuple(f'{i}.' for i in range(1, 10))):
            # Numbered list
            text = clean_text(re.sub(r'^\d+\.\s*', '', line.strip()))
            num_match = re.match(r'^(\d+)\.', line.strip())
            num = num_match.group(1) if num_match else ''
            bullet_style = ParagraphStyle(
                'Numbered',
                parent=styles['Normal'],
                leftIndent=20,
            )
            elements.append(Paragraph(f"{num}. {text}", bullet_style))
        elif line.strip() == '---':
            elements.append(Spacer(1, 10))
        elif line.strip():
            # Regular paragraph
            text = clean_text(line)
            elements.append(Paragraph(text, styles['Normal']))
        else:
            # Empty line
            elements.append(Spacer(1, 3))

        i += 1

    # Handle any remaining table
    if in_table and table_rows:
        elements.append(create_table(table_rows, styles))

    return elements

def clean_text(text):
    """Clean and format text for PDF."""
    # Remove markdown bold/italic and convert to reportlab tags
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    text = re.sub(r'\*(.+?)\*', r'<i>\1</i>', text)
    text = re.sub(r'`(.+?)`', r'<font name="Courier" size="8">\1</font>', text)
    # Remove markdown links but keep text
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    # Escape special XML characters
    text = text.replace('&', '&amp;')
    # Fix any broken tags from the escaping
    text = text.replace('&amp;lt;', '&lt;').replace('&amp;gt;', '&gt;')
    return text

def create_table(rows, styles):
    """Create a table from rows."""
    if not rows:
        return Spacer(1, 0)

    # Normalize row lengths
    max_cols = max(len(row) for row in rows)
    normalized_rows = []
    for row in rows:
        while len(row) < max_cols:
            row.append('')
        normalized_rows.append([clean_text(cell) for cell in row])

    # Create table with proper column widths
    available_width = 6.5 * inch
    col_width = available_width / max_cols

    table = Table(normalized_rows, colWidths=[col_width] * max_cols)

    table_style = TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.9, 0.9, 0.9)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.7, 0.7, 0.7)),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ])

    table.setStyle(table_style)
    return table

def generate_pdf(md_file, pdf_file, title):
    """Generate PDF from markdown file."""
    print(f"Generating {pdf_file}...")

    with open(md_file, 'r', encoding='utf-8') as f:
        md_content = f.read()

    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )

    # Create custom styles
    styles = getSampleStyleSheet()
    # Modify existing heading styles
    styles['Heading1'].fontSize = 18
    styles['Heading1'].spaceAfter = 12
    styles['Heading1'].textColor = colors.Color(0.2, 0.2, 0.6)

    styles['Heading2'].fontSize = 14
    styles['Heading2'].spaceAfter = 8
    styles['Heading2'].textColor = colors.Color(0.3, 0.3, 0.5)

    styles['Heading3'].fontSize = 11
    styles['Heading3'].spaceAfter = 6
    styles['Heading3'].textColor = colors.Color(0.4, 0.4, 0.5)

    # Parse markdown and build PDF
    elements = parse_markdown_to_elements(md_content, styles)

    doc.build(elements)
    print(f"Generated: {pdf_file}")

def main():
    docs_dir = os.path.dirname(os.path.abspath(__file__))

    # Generate TECH_STACK.pdf
    tech_stack_md = os.path.join(docs_dir, 'TECH_STACK.md')
    tech_stack_pdf = os.path.join(docs_dir, 'TECH_STACK.pdf')
    generate_pdf(tech_stack_md, tech_stack_pdf, 'Botilito - Stack Tecnologico')

    # Generate CASE_ID_SYSTEM.pdf
    case_id_md = os.path.join(docs_dir, 'CASE_ID_SYSTEM.md')
    case_id_pdf = os.path.join(docs_dir, 'CASE_ID_SYSTEM.pdf')
    generate_pdf(case_id_md, case_id_pdf, 'Sistema de Identificacion de Casos')

    print("\nDone! PDFs generated in:", docs_dir)

if __name__ == '__main__':
    main()
