import io
from typing import Tuple
import docx

class DocumentService:
    @staticmethod
    def extract_text(filename: str, content_bytes: bytes) -> str:
        name_lower = filename.lower()
        if name_lower.endswith(".txt") or name_lower.endswith(".md"):
            return content_bytes.decode("utf-8", errors="ignore")
        
        elif name_lower.endswith(".docx"):
            file_stream = io.BytesIO(content_bytes)
            doc = docx.Document(file_stream)
            full_text = []
            for para in doc.paragraphs:
                if para.text.strip():
                    full_text.append(para.text.strip())
            return "\n\n".join(full_text)

        elif name_lower.endswith(".pdf"):
            # Try PyPDF or basic PDF text string extraction
            try:
                import pypdf
                reader = pypdf.PdfReader(io.BytesIO(content_bytes))
                pages_text = []
                for p in reader.pages:
                    txt = p.extract_text()
                    if txt:
                        pages_text.append(txt)
                return "\n\n".join(pages_text)
            except Exception:
                # Basic string stream extraction fallback
                raw_text = content_bytes.decode("latin1", errors="ignore")
                import re
                chunks = re.findall(r"\(([A-Za-z0-9 .,;:!?'\"-]{4,})\)", raw_text)
                return " ".join(chunks) if chunks else "Unable to parse binary PDF content without OCR."
        
        return content_bytes.decode("utf-8", errors="ignore")
