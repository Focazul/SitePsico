#!/usr/bin/env node

/**
 * 🔍 TESTE E2E COMPLETO - VALIDAÇÃO DO SISTEMA
 *
 * Este teste valida:
 * 1. Backend está respondendo
 * 2. CSRF middleware está funcionando corretamente
 * 3. tRPC endpoints estão acessíveis com CSRF token
 * 4. Frontend está servindo corretamente
 */

import axios from "axios";

const BACKEND_URL = "https://backend-production-4a6b.up.railway.app";
const FRONTEND_URL = "https://psicologo-sp-site.vercel.app";

console.log("\n🔍 TESTE E2E COMPLETO - VALIDAÇÃO DO SISTEMA");
console.log("=".repeat(70));

let passed = 0;
let failed = 0;
let warnings = 0;

async function logTest(name, fn) {
  try {
    const result = await fn();
    if (result.status === "✅") {
      console.log(`✅ ${name.padEnd(40)} ${result.message}`);
      passed++;
    } else if (result.status === "⚠️") {
      console.log(`⚠️  ${name.padEnd(40)} ${result.message}`);
      warnings++;
    } else {
      console.log(`❌ ${name.padEnd(40)} ${result.message}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${name.padEnd(40)} ${error.message}`);
    failed++;
  }
}

// TEST 1: Backend Health
await logTest("Backend Health", async () => {
  const res = await axios.get(`${BACKEND_URL}/api/health`, { validateStatus: () => true });
  if (res.status === 200 && res.data?.ok) {
    return { status: "✅", message: `200 OK` };
  }
  return { status: "❌", message: `Status ${res.status}` };
});

// TEST 2: CSRF Token Generation
let csrfToken = null;
await logTest("CSRF Token Generation", async () => {
  const res = await axios.get(`${BACKEND_URL}/api/csrf-token`, { validateStatus: () => true });
  if (res.status === 200 && res.data?.token) {
    csrfToken = res.data.token;
    return { status: "✅", message: `Token: ${csrfToken.substring(0, 12)}...` };
  }
  return { status: "❌", message: `Status ${res.status}` };
});

// TEST 3: CSRF Protection (request without token should fail)
await logTest("CSRF Protection Active", async () => {
  const res = await axios.post(
    `${BACKEND_URL}/api/trpc/auth.login`,
    { email: "test@test.com", password: "test123" },
    { validateStatus: () => true }
  );
  if (res.status === 403 && res.data?.error?.includes("CSRF")) {
    return { status: "✅", message: `403 CSRF Required` };
  }
  return { status: "❌", message: `Status ${res.status}` };
});

// TEST 4: tRPC Endpoint with CSRF
await logTest("tRPC Endpoint Accessible", async () => {
  const res = await axios.post(
    `${BACKEND_URL}/api/trpc/auth.login`,
    { email: "admin@psicologo.com", password: "test123" },
    {
      headers: { "x-csrf-token": csrfToken },
      validateStatus: () => true,
    }
  );
  // 200 = success, 400 = validation error (still good!), 429 = rate limited (still good!)
  if ([200, 400, 429].includes(res.status)) {
    return { status: "✅", message: `${res.status} - Reached handler` };
  }
  return { status: "❌", message: `Status ${res.status}` };
});

// TEST 5: Settings Endpoint
await logTest("Settings Endpoint", async () => {
  const res = await axios.get(`${BACKEND_URL}/api/schema-status`, { validateStatus: () => true });
  if (res.status === 200 && res.data?.ok) {
    return { status: "✅", message: `200 OK` };
  }
  return { status: "❌", message: `Status ${res.status}` };
});

// TEST 6: Frontend Accessibility
await logTest("Frontend Loads", async () => {
  const res = await axios.get(FRONTEND_URL, {
    maxRedirects: 5,
    validateStatus: () => true,
  });
  if (res.status === 200) {
    return { status: "✅", message: `200 OK` };
  } else if (res.status === 404) {
    return { status: "❌", message: `404 - Build not deployed` };
  }
  return { status: "❌", message: `Status ${res.status}` };
});

// TEST 7: Database Connected
await logTest("Database Connected", async () => {
  const res = await axios.get(`${BACKEND_URL}/api/schema-status`, { validateStatus: () => true });
  if (res.status === 200 && res.data?.status?.openId) {
    return { status: "✅", message: `Tables: ${Object.keys(res.data.status).length}` };
  }
  return { status: "❌", message: `Could not verify` };
});

console.log("\n" + "=".repeat(70));
console.log(`📋 RESUMO: ✅ ${passed} Passou | ❌ ${failed} Falhou | ⚠️ ${warnings} Avisos`);
console.log("=".repeat(70));

if (failed === 0) {
  console.log("\n🎉 SISTEMA OPERACIONAL!");
  console.log("\n🔗 URLs:");
  console.log(`   Frontend:  ${FRONTEND_URL}`);
  console.log(`   Backend:   ${BACKEND_URL}`);
  console.log(`   Admin:     ${FRONTEND_URL}/admin/settings`);
} else {
  console.log("\n⚠️  FALHAS DETECTADAS - Verifique os detalhes acima");
}

console.log();
process.exit(failed > 0 ? 1 : 0);
