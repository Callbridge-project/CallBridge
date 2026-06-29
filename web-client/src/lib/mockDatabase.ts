/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CallBridge · Mock Database
 * ─────────────────────────────────────────────────────────────────────────────
 * Mimics the Appwrite `databases` SDK surface (listDocuments, getDocument,
 * updateDocument, createDocument) using local fixture data.
 *
 * Pages import `databases` from appwrite.ts — when VITE_USE_MOCK_DATA=true
 * they transparently receive this object instead of the real Appwrite SDK.
 * Zero page-level changes required.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  MOCK_CALL_LOGS,
  MOCK_SMS_LOGS,
  MOCK_DEVICES,
  MOCK_ACTIVITY_LOGS,
  MOCK_SUPPORT_TICKETS,
} from "./mockdata";

// Map collection IDs → fixture arrays
// Matches the collection ID constants exported from appwrite.ts
const COLLECTION_MAP: Record<string, any[]> = {
  call_logs:      MOCK_CALL_LOGS,
  sms_logs:       MOCK_SMS_LOGS,
  devices:        MOCK_DEVICES,
  activity_logs:  MOCK_ACTIVITY_LOGS,
  support_tickets: MOCK_SUPPORT_TICKETS,
  users:          [],
};

// ─── Query parser ─────────────────────────────────────────────────────────────
// Parses the Appwrite Query.xxx() string format so we can filter/sort/paginate
// the local fixture arrays the same way the real SDK would.

type ParsedQuery =
  | { type: "equal"; field: string; value: any }
  | { type: "greaterThanEqual"; field: string; value: any }
  | { type: "lessThanEqual"; field: string; value: any }
  | { type: "orderDesc"; field: string }
  | { type: "orderAsc"; field: string }
  | { type: "limit"; value: number }
  | { type: "cursorAfter"; docId: string }
  | { type: "unknown" };

function parseQuery(q: any): ParsedQuery {
  if (typeof q === "object" && q !== null) {
    const method = q.method;
    const field = q.attribute;
    const values = q.values || [];
    const value = values.length > 0 ? values[0] : undefined;

    if (method === "equal") {
      return { type: "equal", field, value };
    }
    if (method === "greaterThanEqual") {
      return { type: "greaterThanEqual", field, value };
    }
    if (method === "lessThanEqual") {
      return { type: "lessThanEqual", field, value };
    }
    if (method === "orderDesc") {
      return { type: "orderDesc", field };
    }
    if (method === "orderAsc") {
      return { type: "orderAsc", field };
    }
    if (method === "limit") {
      return { type: "limit", value: typeof value === "number" ? value : parseInt(value) };
    }
    if (method === "cursorAfter") {
      return { type: "cursorAfter", docId: value };
    }
    return { type: "unknown" };
  }

  if (typeof q === "string") {
    // Try parsing as a JSON string first (modern Appwrite SDK format)
    try {
      const parsed = JSON.parse(q);
      if (parsed && typeof parsed === "object") {
        const method = parsed.method;
        const field = parsed.attribute;
        const values = parsed.values || [];
        const value = values.length > 0 ? values[0] : undefined;

        if (method === "equal") {
          return { type: "equal", field, value };
        }
        if (method === "greaterThanEqual") {
          return { type: "greaterThanEqual", field, value };
        }
        if (method === "lessThanEqual") {
          return { type: "lessThanEqual", field, value };
        }
        if (method === "orderDesc") {
          return { type: "orderDesc", field };
        }
        if (method === "orderAsc") {
          return { type: "orderAsc", field };
        }
        if (method === "limit") {
          return { type: "limit", value: typeof value === "number" ? value : parseInt(value) };
        }
        if (method === "cursorAfter") {
          return { type: "cursorAfter", docId: value };
        }
        return { type: "unknown" };
      }
    } catch (e) {
      // Fall back to regex parsing of legacy/plain string formats
    }

    // equal("field", ["value"]) or equal("field", "value")
    const equalMatch = q.match(/^equal\("([^"]+)",\s*(?:\[?"?([^"\]]*)"?\]?)\)$/);
    if (equalMatch) {
      const raw = equalMatch[2];
      // Strip surrounding quotes / brackets the regex may have partially captured
      const val: any =
        raw === "true"  ? true  :
        raw === "false" ? false :
        isNaN(Number(raw)) ? raw : Number(raw);
      return { type: "equal", field: equalMatch[1], value: val };
    }

    const gteMatch = q.match(/^greaterThanEqual\("([^"]+)",\s*(?:\[?"?([^"\]]*)"?\]?)\)$/);
    if (gteMatch) {
      const raw = gteMatch[2];
      return { type: "greaterThanEqual", field: gteMatch[1], value: raw };
    }

    const lteMatch = q.match(/^lessThanEqual\("([^"]+)",\s*(?:\[?"?([^"\]]*)"?\]?)\)$/);
    if (lteMatch) {
      const raw = lteMatch[2];
      return { type: "lessThanEqual", field: lteMatch[1], value: raw };
    }

    const orderDescMatch = q.match(/^orderDesc\("([^"]+)"\)$/);
    if (orderDescMatch) return { type: "orderDesc", field: orderDescMatch[1] };

    const orderAscMatch = q.match(/^orderAsc\("([^"]+)"\)$/);
    if (orderAscMatch) return { type: "orderAsc", field: orderAscMatch[1] };

    const limitMatch = q.match(/^limit\((\d+)\)$/);
    if (limitMatch) return { type: "limit", value: parseInt(limitMatch[1]) };

    const cursorMatch = q.match(/^cursorAfter\("([^"]+)"\)$/);
    if (cursorMatch) return { type: "cursorAfter", docId: cursorMatch[1] };
  }

  return { type: "unknown" };
}

// ─── listDocuments ─────────────────────────────────────────────────────────────

function listDocuments(
  _databaseId: string,
  collectionId: string,
  queries: any[] = []
): Promise<{ documents: any[]; total: number }> {
  return new Promise((resolve) => {
    // Simulate a small network delay so spinners render
    setTimeout(() => {
      const allDocs = [...(COLLECTION_MAP[collectionId] ?? [])];

      console.log(`[MockDB] listDocuments for ${collectionId}:`, queries);
      const parsed = queries.map(parseQuery);
      console.log(`[MockDB] parsed queries for ${collectionId}:`, parsed);

      // 1. Filter (equal, greaterThanEqual, lessThanEqual)
      let filtered = allDocs;
      for (const q of parsed) {
        if (q.type === "equal") {
          filtered = filtered.filter((doc) => doc[q.field] === q.value);
        } else if (q.type === "greaterThanEqual") {
          filtered = filtered.filter((doc) => {
            const docVal = doc[q.field];
            if (!docVal) return false;
            return docVal >= q.value;
          });
        } else if (q.type === "lessThanEqual") {
          filtered = filtered.filter((doc) => {
            const docVal = doc[q.field];
            if (!docVal) return false;
            return docVal <= q.value;
          });
        }
      }

      // 2. Sort
      for (const q of parsed) {
        if (q.type === "orderDesc") {
          const field = q.field;
          filtered = [...filtered].sort(
            (a, b) => new Date(b[field] ?? 0).getTime() - new Date(a[field] ?? 0).getTime()
          );
        }
        if (q.type === "orderAsc") {
          const field = q.field;
          filtered = [...filtered].sort(
            (a, b) => new Date(a[field] ?? 0).getTime() - new Date(b[field] ?? 0).getTime()
          );
        }
      }

      // total reflects the full filtered count (before limit/cursor — mirrors Appwrite)
      const total = filtered.length;

      // 3. Cursor-based pagination
      const cursorQuery = parsed.find((q) => q.type === "cursorAfter") as Extract<ParsedQuery, { type: "cursorAfter" }> | undefined;
      if (cursorQuery) {
        const cursorIdx = filtered.findIndex((doc) => doc.$id === cursorQuery.docId);
        if (cursorIdx !== -1) {
          filtered = filtered.slice(cursorIdx + 1);
        }
      }

      // 4. Limit
      const limitQuery = parsed.find((q) => q.type === "limit") as Extract<ParsedQuery, { type: "limit" }> | undefined;
      if (limitQuery) {
        filtered = filtered.slice(0, limitQuery.value);
      }

      resolve({ documents: filtered, total });
    }, 350);
  });
}

// ─── getDocument ───────────────────────────────────────────────────────────────

function getDocument(
  _databaseId: string,
  collectionId: string,
  documentId: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const docs = COLLECTION_MAP[collectionId] ?? [];
      const doc = docs.find((d) => d.$id === documentId);
      if (doc) {
        resolve({ ...doc });
      } else {
        reject(new Error(`[MockDB] Document ${documentId} not found in ${collectionId}`));
      }
    }, 150);
  });
}

// ─── updateDocument ────────────────────────────────────────────────────────────
// Mutates the in-memory fixture array so subsequent reads reflect the update.

function updateDocument(
  _databaseId: string,
  collectionId: string,
  documentId: string,
  data: Record<string, any>
): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const docs = COLLECTION_MAP[collectionId] ?? [];
      const idx = docs.findIndex((d) => d.$id === documentId);
      if (idx === -1) {
        reject(new Error(`[MockDB] Cannot update — document ${documentId} not found in ${collectionId}`));
        return;
      }
      const updated = { ...docs[idx], ...data, $updatedAt: new Date().toISOString() };
      docs[idx] = updated;
      resolve({ ...updated });
    }, 250);
  });
}

// ─── createDocument ────────────────────────────────────────────────────────────
// Appends to the in-memory fixture array so the UI can show the new entry.

function createDocument(
  _databaseId: string,
  collectionId: string,
  documentId: string,
  data: Record<string, any>
): Promise<any> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const newDoc = {
        ...data,
        $id: documentId === "unique()" ? `mock_${Date.now()}` : documentId,
        $createdAt: now,
        $updatedAt: now,
      };
      const docs = COLLECTION_MAP[collectionId];
      if (docs) docs.unshift(newDoc);
      resolve({ ...newDoc });
    }, 400);
  });
}

// ─── Exported mock databases object ──────────────────────────────────────────

export const mockDatabases = {
  listDocuments,
  getDocument,
  updateDocument,
  createDocument,
};
