import re

with open('firestore.rules', 'r') as f:
    code = f.read()

target = """    match /payment_requests/{id} {
      allow read: if isAdmin() || isDataOwner(resource.data);
      allow create: if isAdmin() || isDataOwner(request.resource.data);
      allow update, delete: if isAdmin();
    }"""

replacement = """    match /payment_requests/{id} {
      allow read: if isAdmin() || isDataOwner(resource.data);
      allow create: if isAdmin() || (isDataOwner(request.resource.data) && (request.resource.data.wallet != 'partner' || get(/databases/$(database)/documents/settings/partner).data.withdrawEnabled == true));
      allow update, delete: if isAdmin();
    }"""

if target in code:
    code = code.replace(target, replacement)
else:
    print("TARGET NOT FOUND!")

with open('firestore.rules', 'w') as f:
    f.write(code)
