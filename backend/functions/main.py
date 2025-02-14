import os
# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app, firestore
import google.cloud.firestore
from google.cloud.firestore_v1 import DocumentSnapshot
from datetime import datetime
from typing import Any, Dict, List, Optional
import json
# from flask_cors import CORS
# from flask import Flask

REGION = 'asia-southeast1'

# Initialize Flask app and enable CORS
# flask_app = Flask(__name__)
# CORS(flask_app)

# Initialize Firebase app
firebase_app = initialize_app()

def get_firestore_client() -> google.cloud.firestore.Client:
    """Get a Firestore client instance."""
    return firestore.client()

def serialize_firestore_data(data: Any) -> Any:
    """Recursively convert Firestore data to JSON-serializable format."""
    if isinstance(data, DocumentSnapshot):
        return {"id": data.id, **serialize_firestore_data(data.to_dict())}
    elif isinstance(data, datetime):
        return data.isoformat()
    elif isinstance(data, dict):
        return {k: serialize_firestore_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [serialize_firestore_data(i) for i in data]
    return data

def create_json_response(data: Any, status: int = 200) -> https_fn.Response:
    """Create a JSON response with proper content type."""
    serialized_data = serialize_firestore_data(data)
    return https_fn.Response(json.dumps(serialized_data), status=status, content_type="application/json")

def get_document_by_id(collection: str, doc_id: str) -> Optional[Dict]:
    """Retrieve a single document by ID from a collection."""
    doc = get_firestore_client().collection(collection).document(doc_id).get()
    if not doc.exists:
        return None
    return doc.to_dict()

def get_all_documents(collection: str, order_by: str = None, direction: str = "DESCENDING") -> List[Dict]:
    """Retrieve all documents from a collection with optional ordering."""
    query = get_firestore_client().collection(collection)
    if order_by:
        query = query.order_by(order_by, direction=getattr(firestore.Query, direction))
    docs = query.stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

def add_cors_headers(response: https_fn.Response) -> https_fn.Response:
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type")
    return response

@https_fn.on_request(region=REGION)
def save_contact(req: https_fn.Request) -> https_fn.Response:
    """Save contact information including email and optional personal details."""
    email = req.args.get("email")
    if email is None:
        return https_fn.Response("No email provided", status=400)

    contact_data = {
        "email": email,
        "firstName": req.args.get("firstName", ""),
        "lastName": req.args.get("lastName", ""),
        "phone": req.args.get("phone", ""),
        "country": req.args.get("country", ""),
        "timestamp": firestore.SERVER_TIMESTAMP
    }

    _, doc_ref = get_firestore_client().collection("contacts").add(contact_data)
    response = https_fn.Response(f"Contact with ID {doc_ref.id} added.")
    return add_cors_headers(response)

@https_fn.on_request(region=REGION)
def get_blogs(req: https_fn.Request) -> https_fn.Response:
    """Retrieve all blog posts or a single blog post if id is provided."""
    blog_id = req.args.get("id")
    page_size = req.args.get("pageSize", type=int)
    last_visible = req.args.get("lastVisible")

    if blog_id:
        blog = get_document_by_id("blog", blog_id)
        if not blog:
            response = create_json_response({"error": "Blog post not found"}, 404)
            return add_cors_headers(response)
        response = create_json_response(blog)
        return add_cors_headers(response)

    query = get_firestore_client().collection("blog").order_by("date", direction=firestore.Query.DESCENDING)

    if last_visible:
        last_doc = get_firestore_client().collection("blog").document(last_visible).get()
        query = query.start_after(last_doc)

    if page_size:
        query = query.limit(page_size)

    docs = query.stream()
    blogs = [{"id": doc.id, **doc.to_dict()} for doc in docs]

    response = create_json_response(blogs)
    return add_cors_headers(response)

@https_fn.on_request(region=REGION)
def get_portfolio(req: https_fn.Request) -> https_fn.Response:
    """Retrieve all portfolio items or a single portfolio item if id is provided."""
    portfolio_id = req.args.get("id")
    
    if portfolio_id:
        item = get_document_by_id("portfolio", portfolio_id)
        if not item:
            response = create_json_response({"error": "Portfolio item not found"}, 404)
            return add_cors_headers(response)
        response = create_json_response(item)
        return add_cors_headers(response)
    
    items = get_all_documents("portfolio", order_by="date")
    response = create_json_response(items)
    return add_cors_headers(response)

# @flask_app.route('/save_contact', methods=['GET'])
# def save_contact_route():
#     return save_contact(https_fn.Request())

# @flask_app.route('/get_blogs', methods=['GET'])
# def get_blogs_route():
#     return get_blogs(https_fn.Request())

# @flask_app.route('/get_portfolio', methods=['GET'])
# def get_portfolio_route():
#     return get_portfolio(https_fn.Request())