# Firestore Security Rules

Copy and paste these rules into your Firebase Console (Firestore > Rules tab) to secure your LifeOS data.

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check ownership
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Generic rule for all user-owned data
    // Collections: seasons, projects, tasks, habits, habitLogs, journals, learningItems, resources, inboxItems
    match /{collectionName}/{docId} {
      allow read, write: if isAuthenticated() && 
        (resource == null || isOwner(resource.data.userId)) &&
        (request.resource == null || isOwner(request.resource.data.userId));
    }
    
    // Specific rule for user profiles
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
  }
}
```

### Why these rules?
1. **Authentication:** Only logged-in users can access the database.
2. **Privacy:** Users can only read and write documents where the `userId` matches their Firebase UID.
3. **Data Integrity:** Users cannot "spoof" their `userId` in new documents thanks to the `request.resource.data.userId` check.
