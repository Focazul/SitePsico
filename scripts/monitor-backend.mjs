#!/usr/bin/env node

/**
 * 📊 MONITOR DE LOGS EM TEMPO REAL
 * 
 * Monitora:
 * - Status do backend a cada 30 segundos
 * - Erros de conexão
 * - Performance
 * - Alertas críticos
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'https://backend-production-4a6b.up.railway.app';
const LOG_FILE = path.join(process.cwd(), 'backend-monitoring.log');

// Criar arquivo de log
function writeLog(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  fs.appendFileSync(LOG_FILE, logMessage);
}

async function monitorBackend() {
  writeLog('=== Iniciando monitoramento do backend ===', 'START');
  writeLog(`Backend URL: ${BACKEND_URL}`, 'INFO');
  
  const checks = {
    health: `${BACKEND_URL}/api/health`,
    csrf: `${BACKEND_URL}/api/csrf-token`,
    schema: `${BACKEND_URL}/api/schema-status`,
    settings: `${BACKEND_URL}/api/trpc/settings.getPublic`,
    database: `${BACKEND_URL}/api/trpc/settings.getPublic`
  };

  async function runCheck() {
    writeLog('--- Executando verificações ---', 'CHECK');
    let allOk = true;
    
    for (const [name, url] of Object.entries(checks)) {
      try {
        const start = Date.now();
        const response = await axios.get(url, {
          timeout: 10000,
          validateStatus: () => true
        });
        const duration = Date.now() - start;
        
        if (response.status === 200) {
          writeLog(`✅ ${name.padEnd(12)} → 200 OK (${duration}ms)`, 'OK');
          
          // Verificações específicas
          if (name === 'settings' && Array.isArray(response.data.result?.data?.json)) {
            const count = response.data.result.data.json.length;
            writeLog(`   └─ Settings: ${count} registros encontrados`, 'OK');
          }
        } else {
          writeLog(`⚠️  ${name.padEnd(12)} → ${response.status} ${response.statusText}`, 'WARN');
          allOk = false;
        }
      } catch (error) {
        writeLog(`❌ ${name.padEnd(12)} → ${error.code || error.message}`, 'ERROR');
        allOk = false;
      }
    }
    
    if (allOk) {
      writeLog('✅ Todos os serviços estão operacionais', 'SUCCESS');
    } else {
      writeLog('⚠️  Alguns serviços podem estar com problemas', 'WARN');
    }
    
    writeLog('', 'INFO');
  }

  // Executar verificação inicial
  await runCheck();
  
  // Verificar a cada 30 segundos
  setInterval(runCheck, 30000);
  
  writeLog('Monitoramento em execução (verificação a cada 30 segundos)', 'INFO');
  writeLog(`Logs salvos em: ${LOG_FILE}`, 'INFO');
}

// Iniciar monitoramento
monitorBackend().catch(error => {
  writeLog(`Erro ao iniciar monitoramento: ${error.message}`, 'FATAL');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  writeLog('=== Finalizando monitoramento ===', 'STOP');
  process.exit(0);
});
