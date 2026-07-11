import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  getDocs
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCOyrRlJz8voqUF7UXSe7Lsz-OfEnZcAP4",
  authDomain: "gen-lang-client-0930602584.firebaseapp.com",
  projectId: "gen-lang-client-0930602584",
  storageBucket: "gen-lang-client-0930602584.firebasestorage.app",
  messagingSenderId: "140989933378",
  appId: "1:140989933378:web:1d77d39a8a7febe1a60adb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use the custom firestoreDatabaseId from the provisioned config
export const firestore = getFirestore(app, "ai-studio-bnytopup-32bc94f9-ea19-46d8-a1ed-aee7ababc8f8");

export const db = {
  _isFirestoreWrapper: true,
  firestore
};

export function ref(dbInstance: any, path: string = "") {
  const parts = path.split("/").filter(Boolean);
  return {
    db: dbInstance,
    path,
    parts
  };
}

export function onValue(refObj: any, callback: (snapshot: any) => void, cancelCallback?: (error: any) => void) {
  const parts = refObj.parts;
  const collName = parts[0];

  if (parts.length === 0) {
    return () => {};
  }

  const isDoc = parts.length === 2 || parts.length > 2 || collName === "payment_settings" || collName === "banners";

  if (isDoc) {
    let docId = "default";
    if (parts.length === 2) {
      docId = parts[1];
    } else if (parts.length > 2) {
      docId = parts.slice(1).join("_");
    }
    const docRef = doc(firestore, collName, docId);
    return onSnapshot(
      docRef,
      (docSnap) => {
        const valData = docSnap.exists() ? docSnap.data() : null;
        callback({
          val: () => valData,
          exists: () => docSnap.exists()
        });
      },
      cancelCallback
    );
  } else {
    const colRef = collection(firestore, collName);
    return onSnapshot(
      colRef,
      (colSnap) => {
        const valData: Record<string, any> = {};
        colSnap.forEach((d) => {
          valData[d.id] = d.data();
        });
        callback({
          val: () => valData,
          exists: () => !colSnap.empty
        });
      },
      cancelCallback
    );
  }
}

export async function get(refObj: any) {
  const parts = refObj.parts;
  const collName = parts[0];

  if (parts.length === 0) {
    return { val: () => null, exists: () => false };
  }

  const isDoc = parts.length === 2 || parts.length > 2 || collName === "payment_settings" || collName === "banners";

  if (isDoc) {
    let docId = "default";
    if (parts.length === 2) {
      docId = parts[1];
    } else if (parts.length > 2) {
      docId = parts.slice(1).join("_");
    }
    const docRef = doc(firestore, collName, docId);
    const docSnap = await getDoc(docRef);
    const valData = docSnap.exists() ? docSnap.data() : null;
    return {
      val: () => valData,
      exists: () => docSnap.exists()
    };
  } else {
    const colRef = collection(firestore, collName);
    const colSnap = await getDocs(colRef);
    const valData: Record<string, any> = {};
    colSnap.forEach((d) => {
      valData[d.id] = d.data();
    });
    return {
      val: () => valData,
      exists: () => !colSnap.empty
    };
  }
}

export async function set(refObj: any, data: any) {
  const parts = refObj.parts;
  const collName = parts[0];

  if (parts.length === 0) {
    throw new Error("Cannot set the root reference in Firestore.");
  }

  const isDoc = parts.length === 2 || parts.length > 2 || collName === "payment_settings" || collName === "banners";

  if (isDoc) {
    let docId = "default";
    if (parts.length === 2) {
      docId = parts[1];
    } else if (parts.length > 2) {
      docId = parts.slice(1).join("_");
    }
    const docRef = doc(firestore, collName, docId);
    await setDoc(docRef, data);
  } else {
    throw new Error(`Cannot set a whole collection: ${collName}`);
  }
}

export async function update(refObj: any, data: any) {
  const parts = refObj.parts;

  if (parts.length === 0) {
    for (const [key, val] of Object.entries(data)) {
      const childParts = key.split("/").filter(Boolean);
      const collName = childParts[0];
      let docId = "default";
      if (childParts.length === 2) {
        docId = childParts[1];
      } else if (childParts.length > 2) {
        docId = childParts.slice(1).join("_");
      }
      const docRef = doc(firestore, collName, docId);
      await setDoc(docRef, val, { merge: true });
    }
    return;
  }

  const collName = parts[0];
  const isDoc = parts.length === 2 || parts.length > 2 || collName === "payment_settings" || collName === "banners";

  if (isDoc) {
    let docId = "default";
    if (parts.length === 2) {
      docId = parts[1];
    } else if (parts.length > 2) {
      docId = parts.slice(1).join("_");
    }
    const docRef = doc(firestore, collName, docId);
    await setDoc(docRef, data, { merge: true });
  } else {
    throw new Error(`Cannot update a whole collection: ${collName}`);
  }
}

export async function remove(refObj: any) {
  const parts = refObj.parts;
  const collName = parts[0];

  if (parts.length === 0) {
    throw new Error("Cannot remove root.");
  }

  let docId = "default";
  if (parts.length === 2) {
    docId = parts[1];
  } else if (parts.length > 2) {
    docId = parts.slice(1).join("_");
  }

  const docRef = doc(firestore, collName, docId);
  await deleteDoc(docRef);
}

export function push(refObj: any, data?: any): any {
  const parts = refObj.parts;
  const collName = parts[0];
  const colRef = collection(firestore, collName);
  const newDocRef = doc(colRef);
  const newId = newDocRef.id;
  const newParts = [...parts, newId];
  const newRef = {
    db: refObj.db,
    path: newParts.join("/"),
    parts: newParts
  };

  const promise = (async () => {
    if (data !== undefined) {
      await setDoc(newDocRef, data);
    }
    return {
      key: newId,
      ref: newRef
    };
  })();

  Object.defineProperty(promise, "key", { value: newId, writable: false });
  Object.defineProperty(promise, "ref", { value: newRef, writable: false });

  return promise;
}
