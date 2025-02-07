# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app, firestore
import google.cloud.firestore
from typing import Any, Dict, List, Optional
import json

app = initialize_app()

def get_firestore_client() -> google.cloud.firestore.Client:
    """Get a Firestore client instance."""
    return firestore.client()

def create_json_response(data: Any, status: int = 200) -> https_fn.Response:
    """Create a JSON response with proper content type."""
    return https_fn.Response(json.dumps(data), status=status, content_type="application/json")

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

@https_fn.on_request()
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
    return https_fn.Response(f"Contact with ID {doc_ref.id} added.")

@https_fn.on_request()
def get_blogs(req: https_fn.Request) -> https_fn.Response:
    """Retrieve all blog posts or a single blog post if id is provided."""
    blog_id = req.args.get("id")
    
    if blog_id:
        blog = get_document_by_id("blogs", blog_id)
        if not blog:
            return create_json_response({"error": "Blog post not found"}, 404)
        return create_json_response(blog)
    
    blogs = get_all_documents("blogs", order_by="date")
    return create_json_response(blogs)

@https_fn.on_request()
def get_portfolio(req: https_fn.Request) -> https_fn.Response:
    """Retrieve all portfolio items or a single portfolio item if id is provided."""
    portfolio_id = req.args.get("id")
    
    if portfolio_id:
        item = get_document_by_id("portfolio", portfolio_id)
        if not item:
            return create_json_response({"error": "Portfolio item not found"}, 404)
        return create_json_response(item)
    
    items = get_all_documents("portfolio", order_by="date")
    return create_json_response(items)