/**
 * Digital Signature Utility using Web Crypto API
 */

const KEY_NAME = 'accounting-app-private-key';

export interface KeyPair {
  publicKey: string;
  privateKey: CryptoKey;
}

/**
 * Generates a new RSA-PSS key pair for digital signatures.
 */
export async function generateKeyPair(): Promise<{ publicKey: string; privateKey: CryptoKey }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // extractable
    ["sign", "verify"]
  );

  // Export public key to SPKI format and then to base64 for storage
  const exportedPublic = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  const publicKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPublic)));

  return {
    publicKey: publicKeyBase64,
    privateKey: keyPair.privateKey
  };
}

/**
 * Saves the private key to IndexedDB for persistence.
 */
export async function savePrivateKey(privateKey: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AccountingAppAuth", 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("keys", "readwrite");
      const store = transaction.objectStore("keys");
      store.put(privateKey, KEY_NAME);
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves the private key from IndexedDB.
 */
export async function getPrivateKey(): Promise<CryptoKey | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AccountingAppAuth", 1);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys");
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction("keys", "readonly");
      const store = transaction.objectStore("keys");
      const getRequest = store.get(KEY_NAME);
      
      getRequest.onsuccess = () => resolve(getRequest.result || null);
      getRequest.onerror = () => reject(getRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Signs data using the private key.
 */
export async function signData(data: string, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  const signature = await window.crypto.subtle.sign(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    privateKey,
    encodedData
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/**
 * Verifies a signature using a public key.
 */
export async function verifySignature(data: string, signatureBase64: string, publicKeyBase64: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  
  const signature = new Uint8Array(atob(signatureBase64).split("").map(c => c.charCodeAt(0)));
  const publicKeyBuffer = new Uint8Array(atob(publicKeyBase64).split("").map(c => c.charCodeAt(0)));
  
  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    publicKeyBuffer,
    {
      name: "RSA-PSS",
      hash: "SHA-256",
    },
    true,
    ["verify"]
  );

  return await window.crypto.subtle.verify(
    {
      name: "RSA-PSS",
      saltLength: 32,
    },
    publicKey,
    signature,
    encodedData
  );
}

/**
 * Creates a canonical hash of the voucher data.
 */
export async function hashVoucher(voucher: any): Promise<string> {
  // Create a stable string representation of the voucher data
  const canonicalData = JSON.stringify({
    id: voucher.id,
    number: voucher.number,
    date: voucher.date,
    type: voucher.type,
    totalAmount: voucher.totalAmount,
    items: voucher.items.map((item: any) => ({
      description: item.description,
      amount: item.amount,
      debitAccount: item.debitAccount,
      creditAccount: item.creditAccount
    }))
  });

  const encoder = new TextEncoder();
  const data = encoder.encode(canonicalData);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
