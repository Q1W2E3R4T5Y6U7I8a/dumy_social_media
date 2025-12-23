const admin = require('firebase-admin');
const fs = require('fs');
const { Firestore } = require('@google-cloud/firestore');

// Download serviceAccountKey.json from:
// Firebase Console → Project Settings → Service Accounts → Generate New Private Key

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportFirestore() {
  console.log('📦 Exporting Firestore data...');
  
  // Get ALL collections
  const collectionsSnapshot = await db.listCollections();
  const collections = collectionsSnapshot.map(col => col.id);
  
  console.log(`Found collections: ${collections.join(', ')}`);
  
  const allData = {};
  
  for (const collectionName of collections) {
    try {
      console.log(`\nExporting "${collectionName}"...`);
      
      const snapshot = await db.collection(collectionName).get();
      const documents = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Convert Firebase Timestamps to strings
        Object.keys(data).forEach(key => {
          if (data[key] && typeof data[key] === 'object') {
            if (data[key].toDate) {
              data[key] = data[key].toDate().toISOString();
            } else if (data[key]._seconds) {
              data[key] = new Date(data[key]._seconds * 1000).toISOString();
            }
          }
        });
        
        documents.push({
          id: doc.id,
          ...data
        });
      });
      
      allData[collectionName] = documents;
      console.log(`✓ ${documents.length} documents exported`);
      
      // Save each collection to separate file
      fs.writeFileSync(
        `export_${collectionName}.json`, 
        JSON.stringify(documents, null, 2)
      );
      
    } catch (error) {
      console.log(`✗ Error with ${collectionName}:`, error.message);
    }
  }
  
  // Save combined export
  fs.writeFileSync('firebase-export-all.json', JSON.stringify(allData, null, 2));
  
  console.log('\n✅ EXPORT COMPLETE!');
  console.log('Files created:');
  collections.forEach(col => {
    console.log(`  - export_${col}.json`);
  });
  console.log(`  - firebase-export-all.json (combined)`);
  
  return allData;
}

exportFirestore();