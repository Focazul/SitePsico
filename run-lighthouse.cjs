const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

async function runLighthouse() {
  console.log('🚀 Iniciando Lighthouse audit...\n');
  
  const chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
  });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    }
  };
  
  try {
    const runnerResult = await lighthouse('http://localhost:5174', options);
    
    // Extrair scores
    const scores = {
      performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
      accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
      seo: Math.round(runnerResult.lhr.categories.seo.score * 100)
    };
    
    // Extrair Core Web Vitals
    const audits = runnerResult.lhr.audits;
    const vitals = {
      fcp: {
        value: audits['first-contentful-paint'].displayValue,
        score: Math.round(audits['first-contentful-paint'].score * 100)
      },
      lcp: {
        value: audits['largest-contentful-paint'].displayValue,
        score: Math.round(audits['largest-contentful-paint'].score * 100)
      },
      cls: {
        value: audits['cumulative-layout-shift'].displayValue,
        score: Math.round(audits['cumulative-layout-shift'].score * 100)
      },
      speedIndex: {
        value: audits['speed-index'].displayValue,
        score: Math.round(audits['speed-index'].score * 100)
      },
      tbt: {
        value: audits['total-blocking-time'].displayValue,
        score: Math.round(audits['total-blocking-time'].score * 100)
      }
    };
    
    // Mostrar resultados
    console.log('═══════════════════════════════════════');
    console.log('   🎯 LIGHTHOUSE DESKTOP SCORES');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📊 CATEGORIAS:');
    console.log(`  ⚡ Performance:     ${scores.performance}/100 ${getEmoji(scores.performance)}`);
    console.log(`  ♿ Accessibility:   ${scores.accessibility}/100 ${getEmoji(scores.accessibility)}`);
    console.log(`  ✅ Best Practices:  ${scores.bestPractices}/100 ${getEmoji(scores.bestPractices)}`);
    console.log(`  🔍 SEO:             ${scores.seo}/100 ${getEmoji(scores.seo)}`);
    
    console.log('\n📈 CORE WEB VITALS:');
    console.log(`  FCP (First Contentful Paint):  ${vitals.fcp.value.padEnd(8)} (${vitals.fcp.score}/100) ${getEmoji(vitals.fcp.score)}`);
    console.log(`  LCP (Largest Contentful Paint): ${vitals.lcp.value.padEnd(8)} (${vitals.lcp.score}/100) ${getEmoji(vitals.lcp.score)}`);
    console.log(`  CLS (Cumulative Layout Shift):  ${vitals.cls.value.padEnd(8)} (${vitals.cls.score}/100) ${getEmoji(vitals.cls.score)}`);
    console.log(`  Speed Index:                    ${vitals.speedIndex.value.padEnd(8)} (${vitals.speedIndex.score}/100) ${getEmoji(vitals.speedIndex.score)}`);
    console.log(`  TBT (Total Blocking Time):      ${vitals.tbt.value.padEnd(8)} (${vitals.tbt.score}/100) ${getEmoji(vitals.tbt.score)}`);
    
    console.log('\n═══════════════════════════════════════\n');
    
    // Salvar relatório completo
    fs.writeFileSync('lighthouse-desktop-full.json', JSON.stringify(runnerResult.lhr, null, 2));
    console.log('✅ Relatório completo salvo em: lighthouse-desktop-full.json\n');
    
    // Retornar resultados
    return { scores, vitals };
    
  } catch (error) {
    console.error('❌ Erro ao executar Lighthouse:', error.message);
    throw error;
  } finally {
    await chrome.kill();
  }
}

function getEmoji(score) {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

// Executar
runLighthouse()
  .then(() => {
    console.log('✅ Audit concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Falha no audit:', error);
    process.exit(1);
  });
