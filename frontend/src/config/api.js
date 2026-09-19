/**
 * Central API Configuration for TrustMint
 * Production AWS Serverless Backend
 * API Base: https://w833oaqx0j.execute-api.ap-south-1.amazonaws.com
 *
 * CORS RULE:
 * DO NOT manually add "Content-Type: application/json" to POST requests
 * as confirmed by the team lead to prevent CORS preflight issues on AWS HttpApi.
 */

export const API_BASE_URL = 'https://w833oaqx0j.execute-api.ap-south-1.amazonaws.com';

const ISSUED_DOCS_STORAGE_KEY = 'trustmint_session_issued_docs';

/**
 * Issue / Mint a new document
 * Supports 6 types: prescription, certificate, ticket, invoice, event_pass, id_card
 * @param {string} typeId
 * @param {object} payload
 * @returns {Promise<{doc_id: string, qr_hash: string, warnings?: string[]}>}
 */
export async function createDocument(typeId, payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      body: JSON.stringify({
        type_id: typeId,
        payload,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to create document (Status ${response.status})`);
    }

    // Save to session ledger
    saveIssuedDocument({
      doc_id: data.doc_id,
      qr_hash: data.qr_hash,
      type_id: typeId,
      payload,
      warnings: data.warnings || [],
      created_at: Math.floor(Date.now() / 1000),
      status: 'active',
    });

    return data;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

/**
 * Verify a document by its SHA-256 QR hash
 * @param {string} qrHash - 64-character hex hash
 * @returns {Promise<{result: string, payload?: object, type?: string, verification?: number}>}
 */
export async function verifyDocument(qrHash) {
  try {
    const response = await fetch(`${API_BASE_URL}/verify`, {
      method: 'POST',
      body: JSON.stringify({
        qr_hash: (qrHash || '').trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Verification failed (Status ${response.status})`);
    }

    return data;
  } catch (error) {
    console.error('Error verifying document:', error);
    throw error;
  }
}

/**
 * Revoke an active document by doc_id
 * @param {string} docId - UUID of the document
 * @returns {Promise<{status: string, doc_id: string}>}
 */
export async function revokeDocument(docId) {
  try {
    const cleanDocId = (docId || '').trim();
    const response = await fetch(`${API_BASE_URL}/revoke`, {
      method: 'POST',
      body: JSON.stringify({
        doc_id: cleanDocId,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Revocation failed (Status ${response.status})`);
    }

    // Update local status in ledger
    updateIssuedDocumentStatus(cleanDocId, 'revoked');

    return data;
  } catch (error) {
    console.error('Error revoking document:', error);
    throw error;
  }
}

/**
 * Fetch real live statistics from the AWS backend
 * @returns {Promise<{total: number, active: number, used: number, verified: number, revoked: number, expired: number, fraud_attempts: number}>}
 */
export async function getDashboardStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to load dashboard statistics (Status ${response.status})`);
    }

    const data = await response.json();
    return {
      total: Number(data.total ?? 0),
      active: Number(data.active ?? 0),
      used: Number(data.used ?? 0),
      verified: Number(data.verified ?? 0),
      revoked: Number(data.revoked ?? 0),
      expired: Number(data.expired ?? 0),
      fraud_attempts: Number(data.fraud_attempts ?? 0),
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Download real PDF document from AWS backend
 * @param {string} docId
 * @param {string} [typeId]
 */
export async function downloadDocumentPdf(docId, typeId = 'document') {
  try {
    const cleanDocId = (docId || '').trim();
    if (!cleanDocId) {
      throw new Error('Document ID is required for PDF download.');
    }

    const response = await fetch(`${API_BASE_URL}/pdf?doc_id=${encodeURIComponent(cleanDocId)}`, {
      method: 'GET',
    });

    if (!response.ok) {
      let errMsg = `Failed to download PDF (Status ${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.error) errMsg = errJson.error;
      } catch {
        // If not JSON, use status text
      }
      throw new Error(errMsg);
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `trustmint_${typeId}_${cleanDocId.slice(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return true;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
}

/**
 * Local Session Ledger helpers for issued documents
 */
export function getIssuedDocuments() {
  try {
    const raw = localStorage.getItem(ISSUED_DOCS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveIssuedDocument(doc) {
  try {
    const docs = getIssuedDocuments();
    // Prepend new document
    const updated = [doc, ...docs.filter((d) => d.doc_id !== doc.doc_id)];
    localStorage.setItem(ISSUED_DOCS_STORAGE_KEY, JSON.stringify(updated.slice(0, 50)));
  } catch (err) {
    console.warn('Could not save document to local storage', err);
  }
}

export function updateIssuedDocumentStatus(docId, newStatus) {
  try {
    const docs = getIssuedDocuments();
    const updated = docs.map((d) => (d.doc_id === docId ? { ...d, status: newStatus } : d));
    localStorage.setItem(ISSUED_DOCS_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Could not update document status in local storage', err);
  }
}
