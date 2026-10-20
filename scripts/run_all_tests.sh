#!/usr/bin/env bash
# scripts/run_all_tests.sh — Unified Test Runner for Vision AI
set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "========================================================================"
echo "  VISION AI (SIH26038) — COMPREHENSIVE AUTOMATED TEST SUITE"
echo "========================================================================"

# 1. Environment overrides for sandboxed Python
export KERAS_HOME="/tmp/.keras"
export MPLCONFIGDIR="/tmp/matplotlib"

echo ""
echo "[1/6] Running Backend Node.js Tests..."
npm --prefix backend test

echo ""
echo "[2/6] Running Python Unit Tests (Quality Gate & Evidence)..."
python3 -m unittest discover -s tests/unit

echo ""
echo "[3/6] Running FastAPI Integration Tests..."
python3 -m unittest discover -s tests/integration

echo ""
echo "[4/6] Running Security & Privacy Validation Tests..."
python3 -m unittest discover -s tests/security

echo ""
echo "[5/6] Running Model Evaluation Pipeline Unit Tests..."
python3 -m unittest discover -s evaluation/tests

echo ""
echo "[6/6] Executing Reproducible Referable-DR Benchmark..."
python3 evaluation/scripts/evaluate_referable_dr.py

echo ""
echo "========================================================================"
echo "  ALL TESTS COMPLETED SUCCESSFULLY"
echo "========================================================================"
