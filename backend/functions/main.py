import os
# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn
from firebase_admin import initialize_app, firestore, storage
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
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
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
        query = get_firestore_client().collection('blog').order_by('publishedDate', direction=firestore.Query.DESCENDING)
        
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
        is_admin = params.get("isAdmin", False)  # Check if requester is admin
        
        print(f"Portfolio request - isAdmin: {is_admin}, id: {portfolio_id}, featured: {featured}")

        if portfolio_id:
            # Retrieving a single portfolio item by ID
            item = get_document_by_id("portfolio", portfolio_id)
            if not item:
                print(f"Portfolio item not found: {portfolio_id}")
                return add_cors_headers(create_json_response({"error": "Portfolio item not found"}, 404))
            
            # Add ID to the item
            item["id"] = portfolio_id
            
            # Check if item is published or user is admin
            published_date = item.get('publishedDate')
            if is_admin:
                print(f"Admin access - retrieving portfolio item: {portfolio_id}")
                return add_cors_headers(create_json_response({"data": item}))
            elif is_published(published_date):
                print(f"Published item retrieved: {portfolio_id}")
                return add_cors_headers(create_json_response({"data": item}))
            else:
                print(f"Unpublished item access denied: {portfolio_id}")
                return add_cors_headers(create_json_response({"error": "Portfolio item not available"}, 403))

        # Creating the base query for listing portfolio items - order by publishedDate
        query = get_firestore_client().collection("portfolio").order_by("publishedDate", direction=firestore.Query.DESCENDING)

        # For non-admin users, we need to filter by published date
        # Firestore query can't evaluate dates directly, so we'll filter client-side
        if not is_admin:
            print("Non-admin access - will filter published items after query")
        
        if featured:
            print("Filtering by featured items")
            query = query.where("featured", "==", True)

        # Handle pagination
        if last_visible:
            try:
                last_doc = get_firestore_client().collection("portfolio").document(last_visible).get()
                if last_doc.exists:
                    query = query.start_after(last_doc)
            except Exception as e:
                print(f"Error with pagination: {e}")
                return add_cors_headers(create_json_response({"error": "Invalid pagination cursor"}, 400))

        # Apply limit and execute query - we'll fetch more than needed for non-admin filtering
        actual_limit = page_size * 3 if not is_admin else page_size
        query = query.limit(actual_limit)
        docs = list(query.stream())
        
        # Convert to dictionaries with IDs
        all_items = [{"id": doc.id, **doc.to_dict()} for doc in docs]
        
        # Apply published date filtering for non-admin users
        if not is_admin:
            today = datetime.now().date()
            items = []
            for item in all_items:
                published_date = item.get('publishedDate')
                if published_date and is_published(published_date):
                    items.append(item)
                    if len(items) >= page_size:
                        break
        else:
            items = all_items[:page_size]
        
        # Log summary of results
        print(f"Retrieved {len(items)} portfolio items after filtering")
        
        # Prepare response
        response_data = {
            "data": {
                "items": items,
                "lastVisible": items[-1]["id"] if items else None
            }
        }
        
        return add_cors_headers(create_json_response(response_data))
        
    except Exception as e:
        print(f"Error in get_portfolio: {e}")
        return add_cors_headers(create_json_response({"error": str(e)}, 500))

def is_published(published_date) -> bool:
    """
    Check if published date is today or earlier.
    
    Args:
        published_date: Can be a string date in YYYY-MM-DD format, 
                       a datetime object, or None
    
    Returns:
        bool: True if the item should be considered published, False otherwise
    """
    if published_date is None:
        return True  # Items without a published date are always visible
    
    today = datetime.now().date()
    
    # Handle different published_date types
    try:
        # If it's already a datetime object (like DatetimeWithNanoseconds from Firestore)
        if hasattr(published_date, 'date'):
            return published_date.date() <= today
        
        # If it's a string, parse it
        if isinstance(published_date, str):
            item_date = datetime.strptime(published_date, "%Y-%m-%d").date()
            return item_date <= today
            
        # If we get here, it's an unknown type
        print(f"Warning: Unknown published_date type: {type(published_date)}, value: {published_date}")
        return True
    except ValueError as e:
        # If date format is invalid, log warning and default to showing the item
        print(f"Warning: Invalid date format for publishedDate: {published_date}, error: {e}")
        return True
    except Exception as e:
        # Catch any other errors, log them, and default to showing the item
        print(f"Error processing publishedDate: {published_date}, error: {e}")
        return True

@https_fn.on_request(region=REGION)
def create_portfolio_item(req: https_fn.Request) -> https_fn.Response:
    """Create or update a portfolio item."""
    if req.method == 'OPTIONS':
        return handle_options(req)
    
    try:
        # Parse the request data
        data = json.loads(req.data.decode()) if req.data else {}
        
        # Get the actual parameters from the data field that Cloud Functions uses
        item_data = data.get('data', {})
        
        print(f"Received portfolio item data: {item_data}")
        
        # Validate required fields
        if not item_data.get('title') or not item_data.get('category') or not item_data.get('description'):
            return add_cors_headers(create_json_response({"error": "Missing required fields"}, 400))
            
        # Prepare portfolio item data
        portfolio_item = {
            'title': item_data.get('title'),
            'category': item_data.get('category'),
            'description': item_data.get('description'),
            'imageUrl': item_data.get('imageUrl'),
            'link': item_data.get('link'),
            'featured': bool(item_data.get('featured', False)),
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        # Ensure publishedDate is set correctly
        published_date = item_data.get('publishedDate')
        if published_date:
            try:
                # Validate date format
                datetime.strptime(published_date, "%Y-%m-%d")
                portfolio_item['publishedDate'] = published_date
                print(f"Setting custom publishedDate: {published_date}")
            except ValueError:
                # Default to today if format is invalid
                portfolio_item['publishedDate'] = datetime.now().strftime("%Y-%m-%d")
                print(f"Invalid publishedDate format, using today's date: {portfolio_item['publishedDate']}")
        else:
            # Default to today if not provided
            portfolio_item['publishedDate'] = datetime.now().strftime("%Y-%m-%d")
            print(f"No publishedDate provided, using today's date: {portfolio_item['publishedDate']}")
        
        # Explicitly clear any existing date field to ensure we only use publishedDate
        portfolio_item.pop('date', None)
        
        # Check if this is an update or new item
        item_id = item_data.get('id')
        
        if item_id:
            # Update existing item
            doc_ref = get_firestore_client().collection('portfolio').document(item_id)
            # For existing items, explicitly remove date field if it exists
            doc_ref.update({'date': firestore.DELETE_FIELD})
            doc_ref.update(portfolio_item)
            portfolio_item['id'] = item_id
            print(f"Updated portfolio item: {item_id}")
        else:
            # Create new item
            portfolio_item['createdAt'] = firestore.SERVER_TIMESTAMP
            doc_ref = get_firestore_client().collection('portfolio').document()
            doc_ref.set(portfolio_item)
            portfolio_item['id'] = doc_ref.id
            print(f"Created portfolio item: {doc_ref.id}")
        
        # Replace SERVER_TIMESTAMP with current datetime for JSON serialization
        response_item = portfolio_item.copy()
        current_time = datetime.now().isoformat()
        if 'updatedAt' in response_item:
            response_item['updatedAt'] = current_time
        if 'createdAt' in response_item:
            response_item['createdAt'] = current_time
        
        # Log the final response being sent back to client
        print(f"Sending response for portfolio item: {response_item}")
            
        return add_cors_headers(create_json_response({"data": response_item}))
        
    except Exception as e:
        print(f"Error in create_portfolio_item: {e}")
        return add_cors_headers(create_json_response({"error": str(e)}, 500))

@https_fn.on_request(region=REGION)
def delete_portfolio_item(req: https_fn.Request) -> https_fn.Response:
    """Delete a portfolio item by ID."""
    if req.method == 'OPTIONS':
        return handle_options(req)
    
    try:
        # Parse the request data
        data = json.loads(req.data.decode()) if req.data else {}
        
        # Get the actual parameters from the data field
        params = data.get('data', {})
        item_id = params.get('id')
        
        if not item_id:
            return add_cors_headers(create_json_response({"error": "Missing item ID"}, 400))
        
        # Get the item to check if it exists and retrieve the image URL
        doc_ref = get_firestore_client().collection('portfolio').document(item_id)
        item = doc_ref.get()
        
        if not item.exists:
            return add_cors_headers(create_json_response({"error": "Portfolio item not found"}, 404))
        
        # Check if there's an image to delete
        item_data = item.to_dict()
        image_url = item_data.get('imageUrl')
        
        # Delete from Firestore
        doc_ref.delete()
        print(f"Deleted portfolio item {item_id} from Firestore")
        
        # Try to delete the associated image if it exists
        if image_url:
            try:
                # Convert HTTP URL to storage path
                # Format is typically: https://storage.googleapis.com/PROJECT_ID.appspot.com/path/to/image
                if 'storage.googleapis.com' in image_url:
                    # Extract path after the domain and bucket name
                    path_parts = image_url.split('appspot.com/')
                    if len(path_parts) > 1:
                        storage_path = path_parts[1]
                        bucket = storage.bucket()
                        blob = bucket.blob(storage_path)
                        blob.delete()
                        print(f"Deleted image at {storage_path}")
            except Exception as img_error:
                # Log error but don't fail the whole operation
                print(f"Warning: Could not delete image {image_url}: {img_error}")
        
        return add_cors_headers(create_json_response({
            "data": {
                "success": True,
                "id": item_id,
                "message": "Portfolio item successfully deleted"
            }
        }))
        
    except Exception as e:
        print(f"Error in delete_portfolio_item: {e}")
        return add_cors_headers(create_json_response({"error": str(e)}, 500))

@https_fn.on_request(region=REGION)
def create_blog_post(req: https_fn.Request) -> https_fn.Response:
    """Create a new blog post."""
    if req.method == 'OPTIONS':
        return handle_options(req)
    
    try:
        # Parse the request data
        data = json.loads(req.data.decode()) if req.data else {}
        
        # Get the actual parameters from the data field that Cloud Functions uses
        blog_data = data.get('data', {})
        
        print(f"Received blog post data: {blog_data}")
        
        # Validate required fields
        if not blog_data.get('title') or not blog_data.get('content'):
            return add_cors_headers(create_json_response({"error": "Missing required fields"}, 400))
            
        # Prepare blog post data
        blog_post = {
            'title': blog_data.get('title'),
            'content': blog_data.get('content'),
            'imageUrl': blog_data.get('imageUrl'),
            'updatedAt': firestore.SERVER_TIMESTAMP,
            'tag': blog_data.get('tag')
        }
        
        # Handle publishedDate field
        published_date = blog_data.get('date') or blog_data.get('publishedDate')
        if published_date:
            try:
                # Store date as provided (should be ISO format)
                blog_post['publishedDate'] = published_date
                print(f"Setting blog publishedDate: {published_date}")
            except ValueError:
                # Default to now if format is invalid
                blog_post['publishedDate'] = datetime.now().isoformat()
                print(f"Invalid date format, using current time: {blog_post['publishedDate']}")
        else:
            # Default to now if not provided
            blog_post['publishedDate'] = datetime.now().isoformat()
            print(f"No publishedDate provided, using current time: {blog_post['publishedDate']}")
            
        # For backward compatibility, also set date field to same value
        blog_post['date'] = blog_post['publishedDate']
        
        # Create new blog post
        blog_post['createdAt'] = firestore.SERVER_TIMESTAMP
        doc_ref = get_firestore_client().collection('blog').document()
        doc_ref.set(blog_post)
        blog_post['id'] = doc_ref.id
        print(f"Created blog post: {doc_ref.id}")
        
        # Replace SERVER_TIMESTAMP with current datetime for JSON serialization
        response_item = blog_post.copy()
        current_time = datetime.now().isoformat()
        if 'updatedAt' in response_item:
            response_item['updatedAt'] = current_time
        if 'createdAt' in response_item:
            response_item['createdAt'] = current_time
        
        return add_cors_headers(create_json_response({"data": response_item}))
        
    except Exception as e:
        print(f"Error in create_blog_post: {e}")
        return add_cors_headers(create_json_response({"error": str(e)}, 500))

@https_fn.on_request(region=REGION)
def update_blog_post(req: https_fn.Request) -> https_fn.Response:
    """Update an existing blog post."""
    if req.method == 'OPTIONS':
        return handle_options(req)
    
    try:
        # Parse the request data
        data = json.loads(req.data.decode()) if req.data else {}
        
        # Get the actual parameters from the data field
        blog_data = data.get('data', {})
        blog_id = blog_data.get('id')
        
        print(f"Updating blog post with data: {blog_data}")
        
        if not blog_id:
            return add_cors_headers(create_json_response({"error": "Missing blog post ID"}, 400))
            
        # Validate required fields
        if not blog_data.get('title') or not blog_data.get('content'):
            return add_cors_headers(create_json_response({"error": "Missing required fields"}, 400))
            
        # Check if the blog post exists
        doc_ref = get_firestore_client().collection('blog').document(blog_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return add_cors_headers(create_json_response({"error": "Blog post not found"}, 404))
            
        # Prepare update data
        update_data = {
            'title': blog_data.get('title'),
            'content': blog_data.get('content'),
            'updatedAt': firestore.SERVER_TIMESTAMP
        }
        
        # Handle tag field
        if 'tag' in blog_data:
            update_data['tag'] = blog_data.get('tag')
        
        # Handle optional fields
        if 'imageUrl' in blog_data:
            update_data['imageUrl'] = blog_data.get('imageUrl')
            
        # Handle publishedDate field
        if 'date' in blog_data or 'publishedDate' in blog_data:
            published_date = blog_data.get('publishedDate') or blog_data.get('date')
            update_data['publishedDate'] = published_date
            # For backward compatibility
            update_data['date'] = published_date
            
        # Update the document
        doc_ref.update(update_data)
        print(f"Updated blog post: {blog_id}")
        
        # Get the updated document for the response
        updated_doc = doc_ref.get()
        updated_data = updated_doc.to_dict()
        updated_data['id'] = blog_id
        
        # Replace SERVER_TIMESTAMP with current datetime for JSON serialization
        if 'updatedAt' in updated_data and isinstance(updated_data['updatedAt'], firestore.SERVER_TIMESTAMP.__class__):
            updated_data['updatedAt'] = datetime.now().isoformat()
            
        return add_cors_headers(create_json_response({"data": updated_data}))
        
    except Exception as e:
        print(f"Error in update_blog_post: {e}")
        return add_cors_headers(create_json_response({"error": str(e)}, 500))

@https_fn.on_request(region=REGION)
def delete_blog_post(req: https_fn.Request) -> https_fn.Response:
    """Delete a blog post by ID."""
    if req.method == 'OPTIONS':
        return handle_options(req)
    
    try:
        # Parse the request data
        data = json.loads(req.data.decode()) if req.data else {}
        
        # Get the actual parameters from the data field
        params = data.get('data', {})
        blog_id = params.get('id')
        
        if not blog_id:
            return add_cors_headers(create_json_response({"error": "Missing blog post ID"}, 400))
        
        # Get the blog post to check if it exists and retrieve the image URL
        doc_ref = get_firestore_client().collection('blog').document(blog_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return add_cors_headers(create_json_response({"error": "Blog post not found"}, 404))
        
        # Check if there's an image to delete
        blog_data = doc.to_dict()
        image_url = blog_data.get('imageUrl')
        
        # Delete from Firestore
        doc_ref.delete()
        print(f"Deleted blog post {blog_id} from Firestore")
        
        # Try to delete the associated image if it exists
        if image_url:
            try:
                # Convert HTTP URL to storage path
                # Format is typically: https://storage.googleapis.com/PROJECT_ID.appspot.com/path/to/image
                if 'storage.googleapis.com' in image_url:
                    # Extract path after the domain and bucket name
                    path_parts = image_url.split('appspot.com/')
                    if len(path_parts) > 1:
                        storage_path = path_parts[1]
                        bucket = storage.bucket()
                        blob = bucket.blob(storage_path)
                        blob.delete()
                        print(f"Deleted blog image at {storage_path}")
            except Exception as img_error:
                # Log error but don't fail the whole operation
                print(f"Warning: Could not delete blog image {image_url}: {img_error}")
        
        return add_cors_headers(create_json_response({
            "data": {
                "success": True,
                "id": blog_id,
                "message": "Blog post successfully deleted"
            }
        }))
        
    except Exception as e:
        print(f"Error in delete_blog_post: {e}")
        return add_cors_headers(create_json_response({"error": str(e)}, 500))