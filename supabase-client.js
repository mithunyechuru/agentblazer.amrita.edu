/**
 * ==============================================================================
 * AGENTBLAZER — Supabase Client & Database Service
 * Amrita Vishwa Vidyapeetham, Amaravati
 * ==============================================================================
 *
 * Universal database connector supporting:
 *  1. Supabase JS Client via CDN (window.supabase)
 *  2. Native Direct REST fetch fallback (Zero-dependency resilience)
 *  3. Works as classic browser script, module, or bundler
 * ==============================================================================
 */

(function () {
  "use strict";

  // 1. SUPABASE CREDENTIALS CONFIGURATION
  const SUPABASE_CONFIG = {
    url: "https://rquawxeteaonrepmaqlm.supabase.co", // Base project URL
    anonKey: "sb_publishable_uH8f4CAINR5WWkl85zc8-A_ipUXy7ni"
  };

  // Clean/normalize Supabase URL (strip trailing /rest/v1 or slashes if user copied Data API URL)
  function sanitizeSupabaseUrl(rawUrl) {
    if (!rawUrl) return "";
    let clean = String(rawUrl).trim();
    clean = clean.replace(/\/rest\/v1\/?$/, "");
    clean = clean.replace(/\/+$/, "");
    return clean;
  }

  // Check if credentials have been provided either in code or saved in localStorage
  function getActiveSupabaseConfig() {
    let localUrl = null;
    let localKey = null;

    try {
      if (typeof localStorage !== "undefined") {
        localUrl = localStorage.getItem("ab_supabase_url");
        localKey = localStorage.getItem("ab_supabase_anon_key");
      }
    } catch (e) {
      // Storage access may be restricted in some sandboxed iframes
    }

    let url = localUrl && localUrl.startsWith("http")
      ? localUrl
      : SUPABASE_CONFIG.url;

    url = sanitizeSupabaseUrl(url);

    const anonKey = localKey && localKey.length > 20
      ? localKey
      : SUPABASE_CONFIG.anonKey;

    return { url, anonKey };
  }

  function isSupabaseConfigured() {
    const { url, anonKey } = getActiveSupabaseConfig();
    return (
      Boolean(url) &&
      url !== "REPLACE_WITH_SUPABASE_URL" &&
      url.startsWith("https://") &&
      Boolean(anonKey) &&
      anonKey !== "REPLACE_WITH_SUPABASE_ANON_KEY" &&
      anonKey.length > 20
    );
  }

  // 2. INITIALIZE SUPABASE CLIENT
  let _clientInstance = null;
  let _lastConfigKey = "";

  function resetClient() {
    _clientInstance = null;
    _lastConfigKey = "";
  }

  function getSupabase() {
    const { url, anonKey } = getActiveSupabaseConfig();
    const configKey = url + "||" + anonKey;

    // Invalidate cached client if credentials have changed
    if (_clientInstance && configKey !== _lastConfigKey) {
      _clientInstance = null;
    }

    if (_clientInstance) return _clientInstance;

    if (!isSupabaseConfigured()) {
      return null;
    }

    try {
      if (typeof window !== "undefined" && window.supabase && typeof window.supabase.createClient === "function") {
        _clientInstance = window.supabase.createClient(url, anonKey);
        _lastConfigKey = configKey;
        return _clientInstance;
      }
    } catch (err) {
      console.warn("Could not instantiate Supabase SDK client, falling back to direct REST:", err);
    }

    return null;
  }

  // Helper for direct REST API headers
  function getRestHeaders(anonKey, extraHeaders = {}) {
    return {
      "apikey": anonKey,
      "Authorization": `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      ...extraHeaders
    };
  }

  // 3. DATABASE OPERATIONS

  /**
   * Insert a new student registration into Supabase PostgreSQL
   */
  async function dbInsertRegistration(record) {
    if (!isSupabaseConfigured()) {
      console.warn("Supabase is not configured yet. Falling back to local storage.");
      return { success: false, fallback: true, error: "Supabase credentials not configured" };
    }

    const { url, anonKey } = getActiveSupabaseConfig();
    const client = getSupabase();

    // Map application field names to PostgreSQL snake_case columns
    const row = {
      registration_id: record.registrationId,
      full_name: record.fullName,
      college_email: record.collegeEmail,
      personal_email: record.personalEmail || null,
      contact_number: record.contactNumber,
      whatsapp_number: record.whatsappNumber || record.contactNumber,
      year: record.year,
      branch: record.branch,
      section: record.section || "N/A",
      interests: Array.isArray(record.interests) ? record.interests : [record.interests].filter(Boolean),
      motivation: record.motivation || "",
      ai_agent_idea: record.aiAgentIdea || "None",
      status: record.status || "Under Review"
    };

    try {
      // Method A: Use Supabase JS Client if available
      if (client) {
        const { data, error } = await client
          .from("registrations")
          .insert([row])
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          return { success: false, error: error.message };
        }
        return { success: true, data };
      }

      // Method B: Direct native REST fetch fallback (Zero dependency)
      const res = await fetch(`${url}/rest/v1/registrations`, {
        method: "POST",
        headers: getRestHeaders(anonKey, { "Prefer": "return=representation" }),
        body: JSON.stringify(row)
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Supabase REST insert error:", res.status, errText);
        return { success: false, error: `HTTP ${res.status}: ${errText}` };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("Unexpected error during Supabase insert:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch all registrations from Supabase with reverse chronological ordering
   */
  async function dbFetchRegistrations() {
    if (!isSupabaseConfigured()) {
      return { success: false, fallback: true, data: [] };
    }

    const { url, anonKey } = getActiveSupabaseConfig();
    const client = getSupabase();

    try {
      let rawData = null;

      if (client) {
        const { data, error } = await client
          .from("registrations")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase fetch error:", error);
          return { success: false, error: error.message, data: [] };
        }
        rawData = data;
      } else {
        // Direct REST fetch fallback
        const res = await fetch(`${url}/rest/v1/registrations?select=*&order=created_at.desc`, {
          method: "GET",
          headers: getRestHeaders(anonKey)
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Supabase REST fetch error:", res.status, errText);
          return { success: false, error: `HTTP ${res.status}: ${errText}`, data: [] };
        }

        rawData = await res.json();
      }

      // Convert snake_case table columns back to app camelCase properties
      const formatted = (rawData || []).map(r => ({
        timestamp: r.created_at,
        registrationId: r.registration_id,
        fullName: r.full_name,
        collegeEmail: r.college_email,
        personalEmail: r.personal_email,
        contactNumber: r.contact_number,
        whatsappNumber: r.whatsapp_number,
        year: r.year,
        branch: r.branch,
        section: r.section,
        interests: r.interests || [],
        motivation: r.motivation,
        aiAgentIdea: r.ai_agent_idea,
        status: r.status || "Under Review"
      }));

      return { success: true, data: formatted };
    } catch (err) {
      console.error("Unexpected error fetching from Supabase:", err);
      return { success: false, error: err.message, data: [] };
    }
  }

  /**
   * Update a student's review status in Supabase
   */
  async function dbUpdateStatus(registrationId, newStatus) {
    if (!isSupabaseConfigured()) {
      return { success: false, fallback: true };
    }

    const { url, anonKey } = getActiveSupabaseConfig();
    const client = getSupabase();

    try {
      if (client) {
        const { data, error } = await client
          .from("registrations")
          .update({ status: newStatus })
          .eq("registration_id", registrationId)
          .select();

        if (error) {
          console.error("Supabase update error:", error);
          return { success: false, error: error.message };
        }
        return { success: true, data };
      }

      // Direct REST fallback
      const endpoint = `${url}/rest/v1/registrations?registration_id=eq.${encodeURIComponent(registrationId)}`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: getRestHeaders(anonKey, { "Prefer": "return=representation" }),
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `HTTP ${res.status}: ${errText}` };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err) {
      console.error("Unexpected error updating status:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a student record from Supabase
   */
  async function dbDeleteRegistration(registrationId) {
    if (!isSupabaseConfigured()) {
      return { success: false, fallback: true };
    }

    const { url, anonKey } = getActiveSupabaseConfig();
    const client = getSupabase();

    try {
      if (client) {
        const { error } = await client
          .from("registrations")
          .delete()
          .eq("registration_id", registrationId);

        if (error) {
          console.error("Supabase delete error:", error);
          return { success: false, error: error.message };
        }
        return { success: true };
      }

      // Direct REST fallback
      const endpoint = `${url}/rest/v1/registrations?registration_id=eq.${encodeURIComponent(registrationId)}`;
      const res = await fetch(endpoint, {
        method: "DELETE",
        headers: getRestHeaders(anonKey)
      });

      if (!res.ok) {
        const errText = await res.text();
        return { success: false, error: `HTTP ${res.status}: ${errText}` };
      }

      return { success: true };
    } catch (err) {
      console.error("Unexpected error deleting from Supabase:", err);
      return { success: false, error: err.message };
    }
  }

  const AgentblazerDB = {
    SUPABASE_CONFIG,
    sanitizeSupabaseUrl,
    getActiveSupabaseConfig,
    isSupabaseConfigured,
    getSupabase,
    resetClient,
    dbInsertRegistration,
    dbFetchRegistrations,
    dbUpdateStatus,
    dbDeleteRegistration
  };

  // Expose on global window object for direct script tags
  if (typeof window !== "undefined") {
    window.AgentblazerDB = AgentblazerDB;
  }

  // Support CommonJS / Node environments if imported
  if (typeof module !== "undefined" && module.exports) {
    module.exports = AgentblazerDB;
  }
})();
