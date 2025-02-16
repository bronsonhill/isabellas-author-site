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
def handle_options(req: https_fn.Request) -> https_fn.Response:
    """Handle CORS preflight requests."""
    response = https_fn.Response(status=204)
    return add_cors_headers(response)

@https_fn.on_request(region=REGION)
def save_contact(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'OPTIONS':
        return handle_options(req)

    try:
        data = json.loads(req.data.decode()) if req.data else {}
        print(f'Received data: {data}')  # Add logging to inspect received data
        contact_data = data.get('data', {})  # Extract nested data object
        email = contact_data.get('email')
        if not email:
            return add_cors_headers(https_fn.Response(json.dumps({'error': 'No email provided'}), status=400, content_type='application/json'))

        contact_data = {
            'email': email,
            'firstName': contact_data.get('firstName', ''),
            'lastName': contact_data.get('lastName', ''),
            'phone': contact_data.get('phone', ''),
            'country': contact_data.get('country', ''),
            'timestamp': firestore.SERVER_TIMESTAMP
        }

        _, doc_ref = get_firestore_client().collection('mailingList').add(contact_data)
        response = https_fn.Response(json.dumps({'data': {'id': doc_ref.id}}), status=200, content_type='application/json')
        return add_cors_headers(response)
    except Exception as e:
        print(f'Error saving contact: {e}')
        return add_cors_headers(https_fn.Response(json.dumps({'error': 'Internal Server Error'}), status=500, content_type='application/json'))

@https_fn.on_request(region=REGION)
def get_blogs(req: https_fn.Request) -> https_fn.Response:
    if req.method == 'OPTIONS':
        return handle_options(req)
    try:
        data = json.loads(req.data.decode()) if req.data else {}
        params = data.get('data', {})
        blog_id = params.get('id')
        
        print(f'Received blog_id: {blog_id}')  # Add logging to inspect received blog_id
        
        if blog_id:
            blog = get_document_by_id('blog', blog_id)
            if not blog:
                return add_cors_headers(create_json_response({'error': 'Blog post not found'}, 404))
            return add_cors_headers(create_json_response({'data': blog}))
            
        page_size = int(params.get('pageSize', 3))
        last_visible = params.get('lastVisible')
        query = get_firestore_client().collection('blog').order_by('date', direction=firestore.Query.DESCENDING)
        
        if last_visible:
            try:
                last_doc = get_firestore_client().collection('blog').document(last_visible).get()
                if last_doc.exists:
                    query = query.start_after(last_doc)
            except Exception as e:
                print(f'Error with pagination: {e}')
                return add_cors_headers(create_json_response({'error': 'Invalid pagination cursor'}, 400))
                
        query = query.limit(page_size)
        docs = list(query.stream())
        blogs = [{'id': doc.id, **doc.to_dict()} for doc in docs]
        
        # Handle empty results case
        if not docs:
            response_data = {
                'data': {
                    'items': [],
                    'lastVisible': None
                }
            }
            return add_cors_headers(create_json_response(response_data))
            
        response_data = {
            'data': {
                'items': blogs,
                'lastVisible': docs[-1].id
            }
        }
        return add_cors_headers(create_json_response(response_data))
    except Exception as e:
        print(f'Error in get_blogs: {e}')
        return add_cors_headers(create_json_response({'error': str(e)}, 500))

@https_fn.on_request(region=REGION)
def get_portfolio(req: https_fn.Request) -> https_fn.Response:
    """Retrieve all portfolio items or a single portfolio item if id is provided."""
    if req.method == 'OPTIONS':
        return handle_options(req)
    
    try:
        # Parse the request data
        data = json.loads(req.data.decode()) if req.data else {}
        # Get the actual parameters from the data field that Cloud Functions uses
        params = data.get('data', {})
        
        portfolio_id = params.get("id")
        page_size = int(params.get("pageSize", 6))
        last_visible = params.get("lastVisible")
        featured = params.get("featured", False)

        if portfolio_id:
            item = get_document_by_id("portfolio", portfolio_id)
            if not item:
                print(f"Portfolio item not found: {portfolio_id}")
                return add_cors_headers(create_json_response({"error": "Portfolio item not found"}, 404))
            print(f"Retrieved portfolio item: {item}")
            return add_cors_headers(create_json_response({"data": item}))

        query = get_firestore_client().collection("portfolio").order_by("date", direction=firestore.Query.DESCENDING)

        if featured:
            query = query.where("featured", "==", True)

        if last_visible:
            try:
                last_doc = get_firestore_client().collection("portfolio").document(last_visible).get()
                if last_doc.exists:
                    query = query.start_after(last_doc)
            except Exception as e:
                print(f"Error with pagination: {e}")
                return add_cors_headers(create_json_response({"error": "Invalid pagination cursor"}, 400))

        query = query.limit(page_size)
        docs = list(query.stream())
        items = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        
        # Prepare response
        response_data = {
            "data": {
                "items": items,
                "lastVisible": docs[-1].id if docs else None
            }
        }
        
        return add_cors_headers(create_json_response(response_data))
        
    except Exception as e:
        print(f"Error in get_portfolio: {e}")
        return add_cors_headers(create_json_response({"error": str(e)}, 500))