#!/usr/bin/env python3
"""
🔍 CSRF Token Diagnostic Tool
Analisa logs de console/network e identifica problemas

Uso:
  python3 tests/csrf_diagnostic.py --console-log "log.txt"
  python3 tests/csrf_diagnostic.py --analyze-response "response.json"
"""

import json
import sys
import argparse
from datetime import datetime
from typing import Dict, List, Tuple

class CSRFDiagnostic:
    def __init__(self):
        self.issues: List[str] = []
        self.warnings: List[str] = []
        self.successes: List[str] = []
        self.details: Dict = {}
        
    def analyze_console_logs(self, log_text: str) -> Dict:
        """Analisa logs do console do navegador"""
        print("=" * 60)
        print("🔍 ANALISANDO LOGS DO CONSOLE")
        print("=" * 60)
        
        # Procurar por patterns importantes
        patterns = {
            'csrf_obtained': '[CSRF] Token obtained successfully',
            'csrf_error': '[CSRF] Error getting token',
            'trpc_token_included': '[tRPC Client] CSRF token included',
            'trpc_empty_token': 'EMPTY!',
            'credentials_set': '[tRPC Client] Credentials: include',
            'response_403': 'status: 403',
            'response_401': 'status: 401',
            'response_200': 'status: 200',
        }
        
        results = {}
        for key, pattern in patterns.items():
            if pattern.lower() in log_text.lower():
                results[key] = True
                self.successes.append(f"✅ Encontrado: {pattern}")
            else:
                results[key] = False
        
        # Análise de problemas
        if not results['csrf_obtained'] and not results['csrf_error']:
            self.issues.append("❌ CSRF token não foi obtido (nem sucesso nem erro)")
        elif results['csrf_error']:
            self.issues.append("❌ Erro ao obter CSRF token - verificar endpoint /api/csrf-token")
        
        if results['trpc_empty_token']:
            self.issues.append("❌ Token está VAZIO ao ser enviado!")
            
        if not results['credentials_set']:
            self.warnings.append("⚠️ Credentials pode não estar sendo enviado corretamente")
        
        # Status final
        if results['response_200']:
            self.successes.append("✅ Resposta 200 - Requisição sucesso!")
        elif results['response_403']:
            self.issues.append("❌ Resposta 403 - CSRF token rejeitado pelo servidor")
        elif results['response_401']:
            self.warnings.append("⚠️ Resposta 401 - Usuário não encontrado ou senha errada")
        
        return results
    
    def analyze_network_headers(self, headers_text: str) -> Dict:
        """Analisa headers da requisição de network"""
        print("\n" + "=" * 60)
        print("📡 ANALISANDO HEADERS DE NETWORK")
        print("=" * 60)
        
        results = {}
        
        # Procurar headers importantes
        csrf_header_present = 'x-csrf-token' in headers_text.lower()
        content_type_present = 'content-type' in headers_text.lower()
        cookie_present = 'cookie' in headers_text.lower()
        
        if csrf_header_present:
            self.successes.append("✅ Header X-CSRF-Token presente!")
            results['csrf_header'] = True
        else:
            self.issues.append("❌ Header X-CSRF-Token NÃO encontrado!")
            results['csrf_header'] = False
        
        if content_type_present:
            self.successes.append("✅ Content-Type definido")
            results['content_type'] = True
        
        if cookie_present:
            self.successes.append("✅ Cookies sendo enviados")
            results['cookies'] = True
        else:
            self.warnings.append("⚠️ Cookies não aparecem nos headers")
            results['cookies'] = False
        
        return results
    
    def analyze_response(self, response_json: str) -> Dict:
        """Analisa response do servidor"""
        print("\n" + "=" * 60)
        print("📨 ANALISANDO RESPONSE DO SERVIDOR")
        print("=" * 60)
        
        results = {}
        
        try:
            data = json.loads(response_json)
        except json.JSONDecodeError:
            self.issues.append("❌ Response não é JSON válido")
            return results
        
        # Verificar estrutura tRPC
        if 'ok' in data:
            if data['ok']:
                self.successes.append("✅ Response 'ok': true - Sucesso!")
                results['success'] = True
            else:
                self.warnings.append("⚠️ Response 'ok': false")
                results['success'] = False
                
                # Procurar erro específico
                if 'error' in data:
                    error_msg = data['error'].get('message', 'Desconhecido')
                    if 'csrf' in error_msg.lower():
                        self.issues.append(f"❌ Erro CSRF: {error_msg}")
                    elif 'email' in error_msg.lower() or 'senha' in error_msg.lower():
                        self.warnings.append(f"⚠️ Erro de autenticação: {error_msg}")
                    else:
                        self.issues.append(f"❌ Erro servidor: {error_msg}")
        
        # Verificar estrutura de resultado
        if 'result' in data:
            self.successes.append("✅ Response contém 'result'")
            results['has_result'] = True
        
        return results
    
    def generate_report(self) -> str:
        """Gera relatório de diagnóstico"""
        report = "\n" + "=" * 60
        report += "\n📋 RESUMO DE DIAGNÓSTICO"
        report += "\n" + "=" * 60 + "\n"
        
        if self.successes:
            report += "\n✅ O QUE ESTÁ OK:\n"
            for success in self.successes:
                report += f"   {success}\n"
        
        if self.warnings:
            report += "\n⚠️ AVISOS:\n"
            for warning in self.warnings:
                report += f"   {warning}\n"
        
        if self.issues:
            report += "\n❌ PROBLEMAS ENCONTRADOS:\n"
            for issue in self.issues:
                report += f"   {issue}\n"
        
        # Recomendações
        report += "\n" + "-" * 60
        report += "\n🎯 RECOMENDAÇÕES:\n"
        
        if not self.issues:
            report += "   ✅ Nenhum problema crítico encontrado!\n"
            report += "   → Se login falhou, pode ser usuário não existe\n"
            report += "   → Próximo passo: node scripts/create-admin-manual.mjs\n"
        else:
            if any('token' in i.lower() for i in self.issues):
                report += "   1. Verificar se /api/csrf-token está respondendo\n"
                report += "   2. Testar endpoint direto no navegador\n"
                report += "   3. Verificar logs do servidor no Railway\n"
            if any('header' in i.lower() for i in self.issues):
                report += "   1. Recarregar página (Ctrl+F5)\n"
                report += "   2. Testar em aba incógnita\n"
                report += "   3. Limpar cache do navegador\n"
            if any('403' in i for i in self.issues):
                report += "   1. CSRF token está sendo rejeitado\n"
                report += "   2. Verificar validade do token\n"
                report += "   3. Checar logs: server/_core/csrf.ts\n"
        
        report += "\n" + "=" * 60 + "\n"
        
        return report
    
    def run_interactive_mode(self):
        """Modo interativo de diagnóstico"""
        print("\n" + "=" * 60)
        print("🧪 MODO INTERATIVO - CSRF DIAGNOSTIC")
        print("=" * 60 + "\n")
        
        print("Este script ajuda a diagnosticar problemas com CSRF token.\n")
        print("Escolha uma opção:")
        print("1. Analisar logs do console")
        print("2. Analisar headers de network")
        print("3. Analisar response do servidor")
        print("4. Diagnóstico completo")
        print("0. Sair\n")
        
        choice = input("Digite sua opção (0-4): ").strip()
        
        if choice == '1':
            print("\nCole os logs do console (termine com CTRL+D em Unix ou CTRL+Z+Enter no Windows):")
            logs = sys.stdin.read()
            self.analyze_console_logs(logs)
            print(self.generate_report())
            
        elif choice == '2':
            print("\nCole os headers da requisição:")
            headers = sys.stdin.read()
            self.analyze_network_headers(headers)
            print(self.generate_report())
            
        elif choice == '3':
            print("\nCole o JSON da response:")
            response = sys.stdin.read()
            self.analyze_response(response)
            print(self.generate_report())
            
        elif choice == '4':
            print("\nAnálise completa:")
            print("1. Cole logs do console:")
            logs = sys.stdin.read()
            self.analyze_console_logs(logs)
            
            print("2. Cole headers de network:")
            headers = sys.stdin.read()
            self.analyze_network_headers(headers)
            
            print("3. Cole response JSON:")
            response = sys.stdin.read()
            self.analyze_response(response)
            
            print(self.generate_report())

def main():
    parser = argparse.ArgumentParser(
        description='CSRF Token Diagnostic Tool',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos de uso:
  python3 tests/csrf_diagnostic.py
  python3 tests/csrf_diagnostic.py --console-log console.log
  python3 tests/csrf_diagnostic.py --network headers.txt
  python3 tests/csrf_diagnostic.py --response response.json
        """
    )
    
    parser.add_argument('--console-log', help='Arquivo com logs do console')
    parser.add_argument('--network', help='Arquivo com headers de network')
    parser.add_argument('--response', help='Arquivo com response JSON')
    
    args = parser.parse_args()
    
    diagnostic = CSRFDiagnostic()
    
    if not any([args.console_log, args.network, args.response]):
        # Modo interativo
        diagnostic.run_interactive_mode()
    else:
        # Modo arquivos
        if args.console_log:
            with open(args.console_log, 'r') as f:
                diagnostic.analyze_console_logs(f.read())
        
        if args.network:
            with open(args.network, 'r') as f:
                diagnostic.analyze_network_headers(f.read())
        
        if args.response:
            with open(args.response, 'r') as f:
                diagnostic.analyze_response(f.read())
        
        print(diagnostic.generate_report())

if __name__ == '__main__':
    main()
