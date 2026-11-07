from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_full_analysis_and_pdf_generation():
    payload = {
        "text": (
            "He don't know how to write professional emails. Their is alot of errors in this document. "
            "According to Smith (2023), clarity is essential for academic success.\n\n"
            "References\n"
            "Smith, J. (2023). Educational Writing. Oxford Press.\n"
        ),
        "document_type": "academic",
        "checks": ["grammar", "readability", "ai_signals", "citations"]
    }
    res = client.post("/api/v1/analyses", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "analysis_id" in data
    assert data["metrics"]["word_count"] > 15
    assert len(data["grammar_findings"]) >= 2
    assert data["citations"]["in_text_citations_found"] == 1

    # Test PDF generation endpoint
    analysis_id = data["analysis_id"]
    pdf_res = client.get(f"/api/v1/reports/{analysis_id}/pdf")
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000 # Valid PDF bytes

def test_source_verification_endpoint():
    res = client.post("/api/v1/citations/verify-source", json={"url": "https://example.com"})
    assert res.status_code == 200
    data = res.json()
    assert "url" in data
    assert data["provider"] == "Context.dev"
    assert "status" in data
