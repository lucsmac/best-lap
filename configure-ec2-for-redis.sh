#!/bin/bash
# Script to configure EC2 system settings for Redis

echo "========================================="
echo "EC2 Redis System Configuration"
echo "========================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo "This script needs to be run with sudo"
  echo "Usage: sudo ./configure-ec2-for-redis.sh"
  exit 1
fi

echo "[1/4] Configuring memory overcommit..."
# Enable memory overcommit (required for Redis background saves)
sysctl vm.overcommit_memory=1
if ! grep -q "vm.overcommit_memory = 1" /etc/sysctl.conf; then
  echo "vm.overcommit_memory = 1" >> /etc/sysctl.conf
  echo "✓ Added to /etc/sysctl.conf (persists after reboot)"
else
  echo "✓ Already configured in /etc/sysctl.conf"
fi
echo ""

echo "[2/4] Disabling Transparent Huge Pages (THP)..."
# Disable THP (can cause latency issues with Redis)
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

# Make it persistent across reboots
if ! grep -q "transparent_hugepage" /etc/rc.local; then
  cat >> /etc/rc.local << 'EOF'
# Disable THP for Redis
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
EOF
  chmod +x /etc/rc.local
  echo "✓ THP disabled and configured to persist after reboot"
else
  echo "✓ THP already configured"
fi
echo ""

echo "[3/4] Configuring TCP backlog..."
# Increase TCP backlog (Redis recommendation)
sysctl -w net.core.somaxconn=65535
if ! grep -q "net.core.somaxconn" /etc/sysctl.conf; then
  echo "net.core.somaxconn = 65535" >> /etc/sysctl.conf
  echo "✓ TCP backlog configured"
else
  echo "✓ TCP backlog already configured"
fi
echo ""

echo "[4/4] Verifying current settings..."
echo "Current configuration:"
echo "  - vm.overcommit_memory: $(sysctl -n vm.overcommit_memory) (should be 1)"
echo "  - THP enabled: $(cat /sys/kernel/mm/transparent_hugepage/enabled)"
echo "  - THP defrag: $(cat /sys/kernel/mm/transparent_hugepage/defrag)"
echo "  - net.core.somaxconn: $(sysctl -n net.core.somaxconn) (should be 65535)"
echo ""

echo "========================================="
echo "Configuration Complete!"
echo "========================================="
echo ""
echo "System is now optimized for Redis."
echo "Note: Some settings persist across reboots, but verify after restart."
echo ""
echo "Next steps:"
echo "1. Deploy Redis: ./ec2-fix-redis.sh"
echo "2. Check Redis warnings: docker logs redis 2>&1 | grep WARNING"
echo ""
