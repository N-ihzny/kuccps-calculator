#!/bin/bash

# KUCCPS Course Checker - Deployment Script
# This script automates the deployment process for the application

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$PROJECT_ROOT/deploy.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Deployment options
SKIP_TESTS=${SKIP_TESTS:-false}
SKIP_BUILD=${SKIP_BUILD:-false}
ENVIRONMENT=${ENVIRONMENT:-production}
BACKUP_BEFORE_DEPLOY=${BACKUP_BEFORE_DEPLOY:-true}

# Logging functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

log_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

log_step() {
  echo -e "${CYAN}========================================${NC}" | tee -a "$LOG_FILE"
  echo -e "${CYAN}$1${NC}" | tee -a "$LOG_FILE"
  echo -e "${CYAN}========================================${NC}" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
  log_error "$1"
  exit 1
}

# Cleanup on exit
cleanup() {
  if [ $? -ne 0 ]; then
    log_error "Deployment failed. Check $LOG_FILE for details."
  fi
}

trap cleanup EXIT

# Check prerequisites
check_prerequisites() {
  log_step "Checking Prerequisites"
  
  # Check Node.js
  if ! command -v node &> /dev/null; then
    error_exit "Node.js is not installed. Please install Node.js first."
  fi
  
  NODE_VERSION=$(node --version)
  log_info "Node.js version: $NODE_VERSION"
  
  # Check npm
  if ! command -v npm &> /dev/null; then
    error_exit "npm is not installed. Please install npm first."
  fi
  
  NPM_VERSION=$(npm --version)
  log_info "npm version: $NPM_VERSION"
  
  # Check mysql client (optional but recommended)
  if ! command -v mysql &> /dev/null; then
    log_warning "MySQL client is not installed. Database operations may not work."
  else
    log_info "MySQL client is installed"
  fi
  
  log_success "All prerequisites satisfied\n"
}

# Initialize environment
init_environment() {
  log_step "Initializing Environment"
  
  cd "$PROJECT_ROOT"
  
  if [ ! -f .env ]; then
    if [ -f .env.example ]; then
      log_info "Copying .env.example to .env..."
      cp .env.example .env
      log_warning "Please update .env with your configuration values"
    else
      error_exit ".env file not found and no .env.example template available"
    fi
  fi
  
  log_success ".env file configured\n"
}

# Install dependencies
install_dependencies() {
  log_step "Installing Dependencies"
  
  cd "$PROJECT_ROOT"
  
  log_info "Installing npm packages..."
  npm install
  
  log_success "Dependencies installed\n"
}

# Create/Initialize database
init_database() {
  log_step "Initializing Database"
  
  log_info "Running database initialization..."
  node scripts/init-db.js
  
  log_success "Database initialized\n"
}

# Load seed data
load_seed_data() {
  log_step "Loading Seed Data"
  
  log_info "Loading seed data..."
  node scripts/seed-data.js
  
  log_success "Seed data loaded\n"
}

# Build frontend assets
build_frontend() {
  if [ "$SKIP_BUILD" = true ]; then
    log_warning "Skipping frontend build\n"
    return
  fi
  
  log_step "Building Frontend"
  
  log_info "Building frontend assets..."
  
  # Check if webpack or build script exists
  if [ -f "package.json" ] && grep -q '"build"' package.json; then
    npm run build
  else
    log_warning "No build script found in package.json, skipping build\n"
    return
  fi
  
  log_success "Frontend build completed\n"
}

# Run tests
run_tests() {
  if [ "$SKIP_TESTS" = true ]; then
    log_warning "Skipping tests\n"
    return
  fi
  
  log_step "Running Tests"
  
  if [ ! -d "tests" ] || [ -z "$(ls -A tests)" ]; then
    log_warning "No tests found\n"
    return
  fi
  
  log_info "Running test suite..."
  
  if grep -q '"test"' package.json; then
    npm test || log_warning "Some tests failed, but continuing deployment"
  else
    log_warning "No test script found in package.json\n"
  fi
  
  log_success "Tests completed\n"
}

# Backup database before deployment
backup_database() {
  if [ "$BACKUP_BEFORE_DEPLOY" != true ]; then
    log_warning "Skipping database backup\n"
    return
  fi
  
  log_step "Backing Up Database"
  
  log_info "Creating database backup..."
  
  if [ -f "scripts/backup-db.js" ]; then
    node scripts/backup-db.js --compress
    log_success "Database backup completed\n"
  else
    log_warning "Backup script not found\n"
  fi
}

# Verify deployment
verify_deployment() {
  log_step "Verifying Deployment"
  
  # Check if key files exist
  if [ ! -f "package.json" ]; then
    error_exit "package.json not found"
  fi
  
  if [ ! -d "node_modules" ]; then
    error_exit "node_modules directory not found"
  fi
  
  if [ ! -d "backend" ]; then
    error_exit "backend directory not found"
  fi
  
  log_info "Checking environment configuration..."
  
  if [ ! -f ".env" ]; then
    error_exit ".env file is missing"
  fi
  
  log_success "All verification checks passed\n"
}

# Show deployment summary
show_summary() {
  log_step "Deployment Summary"
  
  echo -e "${CYAN}Deployment Configuration:${NC}" | tee -a "$LOG_FILE"
  echo -e "  ${CYAN}Environment:${NC} $ENVIRONMENT" | tee -a "$LOG_FILE"
  echo -e "  ${CYAN}Project Root:${NC} $PROJECT_ROOT" | tee -a "$LOG_FILE"
  echo -e "  ${CYAN}Timestamp:${NC} $TIMESTAMP" | tee -a "$LOG_FILE"
  echo -e "  ${CYAN}Log File:${NC} $LOG_FILE" | tee -a "$LOG_FILE"
  echo -e "  ${CYAN}Skip Tests:${NC} $SKIP_TESTS" | tee -a "$LOG_FILE"
  echo -e "  ${CYAN}Skip Build:${NC} $SKIP_BUILD" | tee -a "$LOG_FILE"
  echo -e "  ${CYAN}Backup Before Deploy:${NC} $BACKUP_BEFORE_DEPLOY" | tee -a "$LOG_FILE"
  echo "" | tee -a "$LOG_FILE"
}

# Main deployment function
main() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}KUCCPS Course Checker - Deployment${NC}"
  echo -e "${BLUE}========================================${NC}\n"
  
  # Initialize log file
  echo "Deployment started at $TIMESTAMP" > "$LOG_FILE"
  
  show_summary
  check_prerequisites
  init_environment
  install_dependencies
  backup_database
  init_database
  load_seed_data
  build_frontend
  run_tests
  verify_deployment
  
  echo -e "\n${GREEN}========================================${NC}"
  echo -e "${GREEN}Deployment completed successfully!${NC}"
  echo -e "${GREEN}========================================${NC}\n"
  
  log_success "Application is ready for use"
  log_info "Frontend: Open frontend/index.html in your browser"
  log_info "Backend: Start with 'npm start' or 'node backend/server.js'"
  log_info "Logs: See $LOG_FILE for detailed deployment logs\n"
}

# Show usage
show_usage() {
  cat << EOF
${CYAN}KUCCPS Course Checker - Deployment Script${NC}

Usage: ./deploy.sh [OPTIONS]

Options:
  -h, --help              Show this help message
  -e, --env ENV           Set environment (development/production)
  --skip-tests            Skip running tests
  --skip-build            Skip building frontend
  --no-backup             Skip database backup before deployment
  
Environment Variables:
  ENVIRONMENT             Set the deployment environment (default: production)
  SKIP_TESTS              Set to 'true' to skip tests (default: false)
  SKIP_BUILD              Set to 'true' to skip frontend build (default: false)
  BACKUP_BEFORE_DEPLOY    Set to 'false' to skip backup (default: true)

Examples:
  ./deploy.sh                                    # Full deployment
  ./deploy.sh --skip-tests                       # Deploy without running tests
  ENVIRONMENT=development ./deploy.sh --no-backup # Dev deployment without backup
  ./deploy.sh --skip-tests --skip-build           # Deploy without tests and build

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      show_usage
      exit 0
      ;;
    -e|--env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --no-backup)
      BACKUP_BEFORE_DEPLOY=false
      shift
      ;;
    *)
      log_error "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
done

# Run main deployment
main
