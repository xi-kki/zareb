"""Test script to verify the app can start"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from main import app
    print("OK: App imports successfully")
    
    # Test health endpoint
    from fastapi.testclient import TestClient
    client = TestClient(app)
    r = client.get('/health')
    print(f"OK: Health check: {r.json()}")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
