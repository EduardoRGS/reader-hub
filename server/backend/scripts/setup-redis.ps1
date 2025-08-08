# =====================================
# SCRIPT DE SETUP E TROUBLESHOOTING REDIS
# =====================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "restart", "status", "logs", "test", "reset")]
    [string]$Action = "status"
)

Write-Host "=== READER HUB - REDIS SETUP ===" -ForegroundColor Cyan
Write-Host ""

function Test-DockerRunning {
    try {
        docker version | Out-Null
        return $true
    }
    catch {
        Write-Host "❌ Docker não está rodando ou não está instalado!" -ForegroundColor Red
        Write-Host "   Por favor, inicie o Docker Desktop primeiro." -ForegroundColor Yellow
        return $false
    }
}

function Get-RedisStatus {
    Write-Host "📊 Status dos Serviços:" -ForegroundColor Yellow
    Write-Host ""
    
    # Verifica containers
    $containers = docker ps -a --filter "name=readerhub" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers) {
        Write-Host $containers
    } else {
        Write-Host "   Nenhum container encontrado." -ForegroundColor Gray
    }
    
    Write-Host ""
    
    # Testa conexão Redis
    Write-Host "🔍 Testando conexão Redis..." -ForegroundColor Yellow
    try {
        $result = docker exec readerhub-redis redis-cli -a "redis123" ping 2>$null
        if ($result -eq "PONG") {
            Write-Host "   ✅ Redis conectado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Redis não respondeu corretamente." -ForegroundColor Red
        }
    }
    catch {
        Write-Host "   ❌ Não foi possível conectar ao Redis." -ForegroundColor Red
    }
}

function Start-Services {
    Write-Host "🚀 Iniciando serviços..." -ForegroundColor Green
    
    # Verifica se existe .env
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Arquivo .env não encontrado. Copiando .env.example..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "   ✅ Arquivo .env criado. Verifique as configurações!" -ForegroundColor Green
    }
    
    docker-compose up -d
    
    Write-Host ""
    Write-Host "⏳ Aguardando serviços ficarem prontos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    Get-RedisStatus
}

function Stop-Services {
    Write-Host "🛑 Parando serviços..." -ForegroundColor Red
    docker-compose down
}

function Restart-Services {
    Write-Host "🔄 Reiniciando serviços..." -ForegroundColor Blue
    Stop-Services
    Start-Sleep -Seconds 3
    Start-Services
}

function Show-Logs {
    Write-Host "📋 Logs do Redis:" -ForegroundColor Yellow
    Write-Host ""
    docker logs readerhub-redis --tail 50
}

function Test-Connection {
    Write-Host "🧪 Testando conexão completa..." -ForegroundColor Cyan
    Write-Host ""
    
    # Teste básico
    Write-Host "1. Ping básico:" -ForegroundColor Yellow
    docker exec readerhub-redis redis-cli -a "redis123" ping
    
    # Teste de escrita/leitura
    Write-Host ""
    Write-Host "2. Teste de escrita/leitura:" -ForegroundColor Yellow
    docker exec readerhub-redis redis-cli -a "redis123" set test-key "test-value"
    $value = docker exec readerhub-redis redis-cli -a "redis123" get test-key
    Write-Host "   Valor lido: $value"
    docker exec readerhub-redis redis-cli -a "redis123" del test-key
    
    # Info do Redis
    Write-Host ""
    Write-Host "3. Informações do Redis:" -ForegroundColor Yellow
    docker exec readerhub-redis redis-cli -a "redis123" info server | Select-String "redis_version", "uptime_in_seconds"
}

function Reset-Redis {
    Write-Host "🗑️  Resetando dados do Redis..." -ForegroundColor Red
    Write-Host ""
    
    $confirm = Read-Host "Tem certeza que deseja apagar todos os dados do Redis? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        docker exec readerhub-redis redis-cli -a "redis123" FLUSHALL
        Write-Host "   ✅ Dados do Redis removidos!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Operação cancelada." -ForegroundColor Yellow
    }
}

# Verifica se Docker está rodando
if (-not (Test-DockerRunning)) {
    exit 1
}

# Executa ação solicitada
switch ($Action) {
    "start" { Start-Services }
    "stop" { Stop-Services }
    "restart" { Restart-Services }
    "status" { Get-RedisStatus }
    "logs" { Show-Logs }
    "test" { Test-Connection }
    "reset" { Reset-Redis }
    default { Get-RedisStatus }
}

Write-Host ""
Write-Host "=== COMANDOS DISPONÍVEIS ===" -ForegroundColor Cyan
Write-Host "  .\scripts\setup-redis.ps1 start    - Inicia os serviços" -ForegroundColor Gray
Write-Host "  .\scripts\setup-redis.ps1 stop     - Para os serviços" -ForegroundColor Gray
Write-Host "  .\scripts\setup-redis.ps1 restart  - Reinicia os serviços" -ForegroundColor Gray
Write-Host "  .\scripts\setup-redis.ps1 status   - Mostra status" -ForegroundColor Gray
Write-Host "  .\scripts\setup-redis.ps1 logs     - Mostra logs do Redis" -ForegroundColor Gray
Write-Host "  .\scripts\setup-redis.ps1 test     - Testa conexão" -ForegroundColor Gray
Write-Host "  .\scripts\setup-redis.ps1 reset    - Reseta dados do Redis" -ForegroundColor Gray
Write-Host ""