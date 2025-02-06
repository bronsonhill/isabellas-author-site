# The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
from firebase_functions import firestore_fn, https_fn

# The Firebase Admin SDK to access Cloud Firestore.
from firebase_admin import initialize_app, firestore
import google.cloud.firestore

app = initialize_app()

@https_fn.on_request()
def addmessage(req: https_fn.Request) -> https_fn.Response:
    """Take the text parameter passed to this HTTP endpoint and insert it into
    a new document in the messages collection."""
    # Grab the text parameter.
    original = req.args.get("text")
    if original is None:
        return https_fn.Response("No text parameter provided", status=400)

    firestore_client: google.cloud.firestore.Client = firestore.client()

    # Push the new message into Cloud Firestore using the Firebase Admin SDK.
    _, doc_ref = firestore_client.collection("messages").add({"original": original})

    # Send back a message that we've successfully written the message
    return https_fn.Response(f"Message with ID {doc_ref.id} added.")

@https_fn.on_request()
def save_contact(req: https_fn.Request) -> https_fn.Response:
    """Save contact information including email and optional personal details."""
    email = req.json.get("email")
    if email is None:
        return https_fn.Response("No email provided", status=400)

    contact_data = {
        "email": email,
        "firstName": req.json.get("firstName", ""),
        "lastName": req.json.get("lastName", ""),
        "phone": req.json.get("phone", ""),
        "timestamp": firestore.SERVER_TIMESTAMP
    }

    firestore_client: google.cloud.firestore.Client = firestore.client()
    _, doc_ref = firestore_client.collection("contacts").add(contact_data)

    return https_fn.Response(f"Contact with ID {doc_ref.id} added.")